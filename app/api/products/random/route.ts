import { NextResponse } from "next/server";
import { getAllCategories, getRandomProductFromCategory } from "@/lib/products";

export async function GET() {
    const categories = getAllCategories();
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const product = getRandomProductFromCategory(randomCategory);

    if (!product) {
        return NextResponse.json(
            { error: "No product found" },
            { status: 404 }
        );
    }

    return NextResponse.json(product);
}
