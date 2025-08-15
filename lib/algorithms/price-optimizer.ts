import { getMarketDataByCategory } from "../actions/market-data-actions"

// Price optimization algorithm for farmers
type ProductData = {
  _id: string
  name: string
  price: number
  category: string
  stock: number
  sales?: number
  views?: number
  createdAt: Date
  updatedAt: Date
}

type MarketData = {
  category: string
  avgPrice: number
  minPrice: number
  maxPrice: number
  demandScore: number
  seasonalityFactor: number
}

type PriceRecommendation = {
  recommendedPrice: number
  minPrice: number
  maxPrice: number
  currentPrice: number
  priceChange: number
  percentChange: number
  reasoning: string[]
  confidenceScore: number
}

const getDefaultMarketData = (category: string): MarketData => {
  const marketData: Record<string, MarketData> = {
    vegetables: {
      category: "vegetables",
      avgPrice: 120,
      minPrice: 80,
      maxPrice: 200,
      demandScore: 8,
      seasonalityFactor: 1.1,
    },
    fruits: {
      category: "fruits",
      avgPrice: 150,
      minPrice: 100,
      maxPrice: 250,
      demandScore: 7,
      seasonalityFactor: 0.9,
    },
    dairy: {
      category: "dairy",
      avgPrice: 180,
      minPrice: 150,
      maxPrice: 300,
      demandScore: 9,
      seasonalityFactor: 1.0,
    },
    meat: {
      category: "meat",
      avgPrice: 450,
      minPrice: 350,
      maxPrice: 600,
      demandScore: 6,
      seasonalityFactor: 1.0,
    },
    grains: {
      category: "grains",
      avgPrice: 90,
      minPrice: 60,
      maxPrice: 150,
      demandScore: 5,
      seasonalityFactor: 1.05,
    },
    default: {
      category: "other",
      avgPrice: 150,
      minPrice: 100,
      maxPrice: 250,
      demandScore: 5,
      seasonalityFactor: 1.0,
    },
  }

  return marketData[category] || marketData.default
}

const getMarketData = async (category: string): Promise<MarketData> => {
  try {
    const dbMarketData = await getMarketDataByCategory(category)

    if (dbMarketData) {
      return {
        category: dbMarketData.category,
        avgPrice: dbMarketData.avgPrice,
        minPrice: dbMarketData.minPrice,
        maxPrice: dbMarketData.maxPrice,
        demandScore: dbMarketData.demandScore,
        seasonalityFactor: dbMarketData.seasonalityFactor,
      }
    }

    // Fallback to default data if not found in database
    return getDefaultMarketData(category)
  } catch (error) {
    console.error("Error fetching market data:", error)
    return getDefaultMarketData(category)
  }
}

const calculateDemandFactor = (product: ProductData): number => {
  if (!product.views && !product.sales) return 1.0

  const views = product.views || 0
  const sales = product.sales || 0

  const conversionRate = views > 0 ? sales / views : 0

  if (conversionRate > 0.2) return 1.15
  if (conversionRate > 0.1) return 1.05
  if (conversionRate > 0.05) return 1.0
  return 0.95
}

const calculateStockFactor = (product: ProductData): number => {
  if (product.stock <= 5) return 1.1
  if (product.stock <= 20) return 1.05
  if (product.stock <= 50) return 1.0
  return 0.95
}

export const optimizePrice = async (
  product: ProductData,
  similarProducts: ProductData[] = [],
): Promise<PriceRecommendation> => {
  const marketData = await getMarketData(product.category)
  const demandFactor = calculateDemandFactor(product)
  const stockFactor = calculateStockFactor(product)

  let competitiveFactor = 1.0
  const reasoning: string[] = []

  if (similarProducts.length > 0) {
    const avgCompetitorPrice = similarProducts.reduce((sum, p) => sum + p.price, 0) / similarProducts.length

    if (product.price > avgCompetitorPrice * 1.2) {
      competitiveFactor = 0.9
      reasoning.push(
        `Your price (Rs. ${product.price}) is significantly higher than similar products (avg: Rs. ${avgCompetitorPrice.toFixed(2)}). Consider lowering your price to be more competitive.`,
      )
    } else if (product.price < avgCompetitorPrice * 0.8) {
      competitiveFactor = 1.1
      reasoning.push(
        `Your price (Rs. ${product.price}) is significantly lower than similar products (avg: Rs. ${avgCompetitorPrice.toFixed(2)}). You might be able to increase your price while remaining competitive.`,
      )
    } else {
      reasoning.push(
        `Your price (Rs. ${product.price}) is competitive with similar products (avg: Rs. ${avgCompetitorPrice.toFixed(2)}).`,
      )
    }
  } else {
    reasoning.push("No similar products found for direct comparison.")
  }

  if (product.price < marketData.minPrice) {
    reasoning.push(
      `Your price is below the typical minimum price (Rs. ${marketData.minPrice}) for ${product.category}.`,
    )
  } else if (product.price > marketData.maxPrice) {
    reasoning.push(
      `Your price is above the typical maximum price (Rs. ${marketData.maxPrice}) for ${product.category}.`,
    )
  } else {
    reasoning.push(
      `Your price is within the typical price range (Rs. ${marketData.minPrice} - Rs. ${marketData.maxPrice}) for ${product.category}.`,
    )
  }

  if (demandFactor > 1.05) {
    reasoning.push("Demand for your product appears to be high based on views and sales conversion rate.")
  } else if (demandFactor < 0.95) {
    reasoning.push("Demand for your product appears to be low based on views and sales conversion rate.")
  }

  if (stockFactor > 1.05) {
    reasoning.push(`Your current stock is low (${product.stock} units), which may justify a higher price.`)
  } else if (stockFactor < 0.95) {
    reasoning.push(
      `Your current stock is high (${product.stock} units), which may require a lower price to increase sales.`,
    )
  }

  if (marketData.seasonalityFactor > 1.05) {
    reasoning.push(`${product.category} are currently in season, which typically allows for higher prices.`)
  } else if (marketData.seasonalityFactor < 0.95) {
    reasoning.push(`${product.category} are currently out of season, which may require lower prices.`)
  }

  const baseRecommendedPrice = marketData.avgPrice * marketData.seasonalityFactor
  const recommendedPrice = Math.round(baseRecommendedPrice * demandFactor * stockFactor * competitiveFactor)

  const minPrice = Math.round(recommendedPrice * 0.9)
  const maxPrice = Math.round(recommendedPrice * 1.1)

  const priceChange = recommendedPrice - product.price
  const percentChange = (priceChange / product.price) * 100

  let confidenceScore = 70
  if (similarProducts.length > 5) confidenceScore += 10
  if (product.views && product.views > 50) confidenceScore += 5
  if (product.sales && product.sales > 10) confidenceScore += 5
  if (Math.abs(percentChange) > 20) confidenceScore -= 10

  confidenceScore = Math.max(1, Math.min(100, confidenceScore))

  if (Math.abs(percentChange) < 5) {
    reasoning.push("Your current price appears to be optimal. No significant change recommended.")
  } else if (priceChange > 0) {
    reasoning.push(
      `Consider increasing your price by approximately Rs. ${priceChange.toFixed(2)} (${percentChange.toFixed(1)}%).`,
    )
  } else {
    reasoning.push(
      `Consider decreasing your price by approximately Rs. ${Math.abs(priceChange).toFixed(2)} (${Math.abs(percentChange).toFixed(1)}%).`,
    )
  }

  return {
    recommendedPrice,
    minPrice,
    maxPrice,
    currentPrice: product.price,
    priceChange,
    percentChange,
    reasoning,
    confidenceScore,
  }
}

export const getSimilarProducts = async (productId: string, category: string, farmerId: string) => {
  return []
}

export const getProductAnalytics = async (productId: string) => {
  return {
    views: Math.floor(Math.random() * 100),
    sales: Math.floor(Math.random() * 20),
  }
}
