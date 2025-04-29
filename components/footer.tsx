export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8 bg-primary text-primary-foreground">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <p className="text-center text-sm leading-loose md:text-left">
          © {new Date().getFullYear()} FarmerWeb. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-sm hover:underline">
            Terms
          </a>
          <a href="#" className="text-sm hover:underline">
            Privacy
          </a>
          <a href="#" className="text-sm hover:underline">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
