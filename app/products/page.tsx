import { getProducts } from "@/lib/actions/product-actions"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-muted-foreground">Browse our selection of fresh farm products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product: any) => (
              <Card key={product._id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    alt={product.name}
                    className="object-cover"
                    fill
                    src={product.images[0] || "/placeholder.svg?height=200&width=200"}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">By {product.farmerName}</p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/products/${product._id}`} className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
