"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import type { MarketData } from "../db-models";

export async function getAllMarketData() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const marketData = await db
      .collection("marketData")
      .find({})
      .sort({ category: 1 })
      .toArray();

    return JSON.parse(JSON.stringify(marketData));
  } catch (error) {
    console.error("Get all market data error:", error);
    return [];
  }
}

export async function getMarketDataByCategory(category: string) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const marketData = await db
      .collection("marketData")
      .findOne({ category: category.toLowerCase() });

    if (!marketData) {
      // Return default market data if not found
      return {
        category: category.toLowerCase(),
        avgPrice: 150,
        minPrice: 100,
        maxPrice: 250,
        demandScore: 5,
        seasonalityFactor: 1.0,
      };
    }

    return JSON.parse(JSON.stringify(marketData));
  } catch (error) {
    console.error("Get market data by category error:", error);
    // Return default market data on error
    return {
      category: category.toLowerCase(),
      avgPrice: 150,
      minPrice: 100,
      maxPrice: 250,
      demandScore: 5,
      seasonalityFactor: 1.0,
    };
  }
}

export async function createMarketData(data: {
  category: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  demandScore: number;
  seasonalityFactor: number;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Check if market data for this category already exists
    const existingData = await db
      .collection("marketData")
      .findOne({ category: data.category.toLowerCase() });
    if (existingData) {
      return { error: "Market data for this category already exists" };
    }

    const marketData: MarketData = {
      ...data,
      category: data.category.toLowerCase(),
      lastUpdatedBy: session.user.id!,
      lastUpdatedByName: session.user.name!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("marketData").insertOne(marketData);

    revalidatePath("/admin/market-data");
    return { success: "Market data created successfully" };
  } catch (error) {
    console.error("Create market data error:", error);
    return { error: "Failed to create market data" };
  }
}

export async function updateMarketData(
  id: string,
  data: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    demandScore: number;
    seasonalityFactor: number;
  }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    await db.collection("marketData").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          lastUpdatedBy: session.user.id!,
          lastUpdatedByName: session.user.name!,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/admin/market-data");
    return { success: "Market data updated successfully" };
  } catch (error) {
    console.error("Update market data error:", error);
    return { error: "Failed to update market data" };
  }
}

export async function deleteMarketData(id: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    await db.collection("marketData").deleteOne({ _id: new ObjectId(id) });

    revalidatePath("/admin/market-data");
    return { success: "Market data deleted successfully" };
  } catch (error) {
    console.error("Delete market data error:", error);
    return { error: "Failed to delete market data" };
  }
}

export async function initializeDefaultMarketData() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const defaultData = [
      {
        category: "vegetables",
        avgPrice: 120,
        minPrice: 80,
        maxPrice: 200,
        demandScore: 8,
        seasonalityFactor: 1.1,
      },
      {
        category: "fruits",
        avgPrice: 150,
        minPrice: 100,
        maxPrice: 250,
        demandScore: 7,
        seasonalityFactor: 0.9,
      },
      {
        category: "dairy",
        avgPrice: 180,
        minPrice: 150,
        maxPrice: 300,
        demandScore: 9,
        seasonalityFactor: 1.0,
      },
      {
        category: "meat",
        avgPrice: 450,
        minPrice: 350,
        maxPrice: 600,
        demandScore: 6,
        seasonalityFactor: 1.0,
      },
      {
        category: "grains",
        avgPrice: 90,
        minPrice: 60,
        maxPrice: 150,
        demandScore: 5,
        seasonalityFactor: 1.05,
      },
    ];

    for (const data of defaultData) {
      const existingData = await db
        .collection("marketData")
        .findOne({ category: data.category });
      if (!existingData) {
        const marketData: MarketData = {
          ...data,
          lastUpdatedBy: session.user.id!,
          lastUpdatedByName: session.user.name!,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.collection("marketData").insertOne(marketData);
      }
    }

    revalidatePath("/admin/market-data");
    return { success: "Default market data initialized successfully" };
  } catch (error) {
    console.error("Initialize default market data error:", error);
    return { error: "Failed to initialize default market data" };
  }
}
