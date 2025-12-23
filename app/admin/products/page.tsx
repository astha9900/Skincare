"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import type { Product } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Pencil, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProductFormDialog } from "@/components/product-form-dialog"

export default function AdminProductsPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }
    setIsAuthorized(true)

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
    let updatedProducts: Product[]

    if (editingProduct) {
      // Update existing product
      updatedProducts = products.map((p) => (p.id === product.id ? product : p))
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      })
    } else {
      // Add new product
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

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Product Management</h1>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="bg-brand-primary hover:bg-brand-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <Link href="/admin">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                        <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
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
                    <div className="flex items-center gap-4 mt-3">
                      <span className="font-bold">₹{product.price}</span>
                      {product.discount && (
                        <Badge className="bg-brand-accent text-white">{product.discount}% OFF</Badge>
                      )}
                      <Badge className={product.inStock ? "bg-green-500" : "bg-red-500"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{product.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} product={editingProduct} onSave={handleSave} />
    </div>
  )
}
