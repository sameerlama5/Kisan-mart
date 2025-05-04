import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/actions/product-actions"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Image from "next/image"

export default async function Home() {
  const featuredProducts = await getProducts()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Fresh Farm Products Directly From Farmers
                </h1>
                <p className="max-w-[600px] md:text-xl">
                  Support local farmers and enjoy fresh, high-quality produce delivered to your doorstep.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/products">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto">
              <Image
                alt="Farm fresh produce"
                className="rounded-xl object-cover"
                height="400"
                src="/placeholder.svg?height=400&width=600"
                width="600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Featured Products</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover our selection of fresh, seasonal products from local farmers.
              </p>
            </div>
          </div>
          <div className="mx-auto grid grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.slice(0, 8).map((product: any) => (
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
                  <p className="font-medium mt-2">${product.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/products/${product._id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Simple steps to get fresh farm products delivered to your doorstep.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold">Browse Products</h3>
              <p className="text-muted-foreground">
                Explore our wide selection of fresh farm products from local farmers.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold">Place Your Order</h3>
              <p className="text-muted-foreground">Add products to your cart and complete your purchase securely.</p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold">Receive Fresh Products</h3>
              <p className="text-muted-foreground">Get your fresh farm products delivered right to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join as Farmer */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-accent text-accent-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Are You a Farmer?</h2>
                <p className="max-w-[600px] md:text-xl">
                  Join our platform to sell your products directly to customers and grow your business.
                </p>
              </div>
              <div>
                <Link href="/register?role=farmer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10"
                  >
                    Join as Farmer
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto">
              <Image
                alt="Farmer with produce"
                className="rounded-xl object-cover"
                height="400"
                src="/placeholder.svg?height=400&width=600"
                width="600"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
