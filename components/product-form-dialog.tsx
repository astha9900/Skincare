"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Product } from "@/lib/mock-data"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (product: Product) => void
}

export function ProductFormDialog({ open, onOpenChange, product, onSave }: ProductFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    brand: "",
    category: "Face Care",
    price: 0,
    originalPrice: 0,
    discount: 0,
    rating: 4.5,
    reviews: 0,
    image: "",
    description: "",
    ingredients: "",
    howToUse: "",
    inStock: true,
  })

  useEffect(() => {
    if (product) {
      setFormData(product)
    } else {
      setFormData({
        name: "",
        brand: "",
        category: "Face Care",
        price: 0,
        originalPrice: 0,
        discount: 0,
        rating: 4.5,
        reviews: 0,
        image: "",
        description: "",
        ingredients: "",
        howToUse: "",
        inStock: true,
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const productData: Product = {
      id: product?.id || `prod-${Date.now()}`,
      name: formData.name!,
      brand: formData.brand!,
      category: formData.category!,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice),
      discount: Number(formData.discount),
      rating: Number(formData.rating),
      reviews: Number(formData.reviews),
      image: formData.image || `/placeholder.svg?height=400&width=400&query=${formData.name}`,
      description: formData.description!,
      ingredients: formData.ingredients!,
      howToUse: formData.howToUse!,
      inStock: formData.inStock!,
    }

    onSave(productData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product details below." : "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Vitamin C Face Wash"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., Mamaearth"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Face Care">Face Care</SelectItem>
                <SelectItem value="Hair Care">Hair Care</SelectItem>
                <SelectItem value="Body Care">Body Care</SelectItem>
                <SelectItem value="Anti-Aging">Anti-Aging</SelectItem>
                <SelectItem value="Acne Care">Acne Care</SelectItem>
                <SelectItem value="Sun Care">Sun Care</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="299"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price (₹)</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                placeholder="399"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                placeholder="15"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                placeholder="4.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviews">Total Reviews</Label>
              <Input
                id="reviews"
                type="number"
                value={formData.reviews}
                onChange={(e) => setFormData({ ...formData, reviews: Number(e.target.value) })}
                placeholder="1200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg or leave empty for auto-generated"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of the product..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients">Key Ingredients</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              placeholder="Vitamin C, Turmeric, Aloe Vera..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="howToUse">How to Use</Label>
            <Textarea
              id="howToUse"
              value={formData.howToUse}
              onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
              placeholder="Apply to clean skin..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
            />
            <Label htmlFor="inStock">In Stock</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90">
              {product ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
