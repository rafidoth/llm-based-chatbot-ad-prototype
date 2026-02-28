import productsData from "@/data/products.json";

export interface Product {
    name: string;
    url: string;
    desc: string;
    category: string;
}

interface CategoryData {
    names: string[];
    urls: string[];
    descs: string[];
}

const productsMap = productsData as unknown as Record<string, CategoryData>;

export function getAllCategories(): string[] {
    return Object.keys(productsMap);
}

export function getProductsByCategory(category: string): Product[] {
    const data = productsMap[category];
    if (!data || !data.names) return [];

    return data.names.map((name, i) => ({
        name,
        url: data.urls[i] || "",
        desc: data.descs[i] || "",
        category,
    }));
}

export function getRandomProductFromCategory(category: string): Product | null {
    const products = getProductsByCategory(category);
    if (products.length === 0) return null;
    return products[Math.floor(Math.random() * products.length)];
}

