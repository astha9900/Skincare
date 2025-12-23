"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import type { Product } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, DollarSign, Pencil, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ProductFormDialog } from "@/components/product-form-dialog"

export default function VendorDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [vendorBrand, setVendorBrand] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "vendor") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)
    setVendorBrand(user.vendorBrand || "")

    const stored = localStorage.getItem("products")
    if (stored) {
      setProducts(JSON.parse(stored))
    }
  }, [router])

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter((p) => p.id !== productId)
      setProducts(updatedProducts)
      localStorage.setItem("products", JSON.stringify(updatedProducts))
      toast({
        title: "Product deleted",
        description: "The product has been removed successfully.",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const handleSave = (product: Product) => {
    product.brand = vendorBrand

    let updatedProducts: Product[]

    if (editingProduct) {
      updatedProducts = products.map((p) => (p.id === product.id ? product : p))
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      })
    } else {
      updatedProducts = [...products, product]
      toast({
        title: "Product added",
        description: "The product has been added successfully.",
      })
    }

    setProducts(updatedProducts)
    localStorage.setItem("products", JSON.stringify(updatedProducts))
    setDialogOpen(false)
    setEditingProduct(null)
  }

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  const vendorProducts = products.filter((p) => p.brand === vendorBrand)
  const totalRevenue = vendorProducts.reduce((sum, p) => sum + p.price * p.reviews, 0)

  const stats = [
    {
      title: "My Products",
      value: vendorProducts.length,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Sales",
      value: vendorProducts.reduce((sum, p) => sum + p.reviews, 0),
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Revenue (Est.)",
      value: `₹${totalRevenue}`,
      icon: DollarSign,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Vendor Panel</h1>
              <p className="text-sm text-muted-foreground">{vendorBrand}</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Store</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Products</CardTitle>
              <Button onClick={handleAdd} className="bg-brand-primary hover:bg-brand-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendorProducts.map((product) => (
                <div key={product.id} className="flex gap-4 border-b pb-4 last:border-0">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="font-bold">₹{product.price}</span>
                          <span className="text-sm text-muted-foreground">{product.reviews} reviews</span>
                          <span className="text-sm">{product.rating} ★</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editingProduct} onSave={handleSave} />
    </div>
  )
}
