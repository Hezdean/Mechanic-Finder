import { Request, Response } from "express";

// Mock data for marketplace functionality until backend is fully implemented
export const getPartsHandler = async (req: Request, res: Response) => {
  try {
    const mockParts = [
      {
        id: 1,
        name: "Premium Brake Pads Set",
        brand: "Bosch",
        price: "89.99",
        stockQuantity: 15,
        condition: "new",
        partNumber: "BP1234",
        images: [],
        vendorId: 1,
        categoryId: 1,
        description: "High-quality brake pads for most vehicles",
        featured: true
      },
      {
        id: 2,
        name: "Oil Filter",
        brand: "Fram",
        price: "12.99",
        stockQuantity: 25,
        condition: "new",
        partNumber: "OF5678",
        images: [],
        vendorId: 2,
        categoryId: 2,
        description: "Standard oil filter for regular maintenance",
        featured: false
      },
      {
        id: 3,
        name: "Air Filter",
        brand: "K&N",
        price: "24.99",
        stockQuantity: 8,
        condition: "new",
        partNumber: "AF9012",
        images: [],
        vendorId: 1,
        categoryId: 2,
        description: "High-performance air filter",
        featured: true
      }
    ];

    res.json(mockParts);
  } catch (error) {
    console.error("Error fetching parts:", error);
    res.status(500).json({ message: "Failed to fetch parts" });
  }
};

export const getCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const mockCategories = [
      { id: 1, name: "Brakes", slug: "brakes", description: "Brake parts and accessories" },
      { id: 2, name: "Engine", slug: "engine", description: "Engine parts and components" },
      { id: 3, name: "Transmission", slug: "transmission", description: "Transmission parts" },
      { id: 4, name: "Suspension", slug: "suspension", description: "Suspension components" }
    ];

    res.json(mockCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const getFeaturedPartsHandler = async (req: Request, res: Response) => {
  try {
    const mockFeaturedParts = [
      {
        id: 1,
        name: "Premium Brake Pads Set",
        brand: "Bosch",
        price: "89.99",
        stockQuantity: 15,
        condition: "new",
        partNumber: "BP1234",
        images: [],
        featured: true
      },
      {
        id: 3,
        name: "Air Filter",
        brand: "K&N",
        price: "24.99",
        stockQuantity: 8,
        condition: "new",
        partNumber: "AF9012",
        images: [],
        featured: true
      }
    ];

    res.json(mockFeaturedParts);
  } catch (error) {
    console.error("Error fetching featured parts:", error);
    res.status(500).json({ message: "Failed to fetch featured parts" });
  }
};

export const getPartByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const mockPart = {
      id: parseInt(id),
      name: "Premium Brake Pads Set",
      brand: "Bosch",
      price: "89.99",
      stockQuantity: 15,
      condition: "new",
      partNumber: "BP1234",
      images: [],
      vendorId: 1,
      categoryId: 1,
      description: "High-quality brake pads designed for optimal stopping power and durability. Compatible with most passenger vehicles.",
      specifications: {
        "Material": "Ceramic",
        "Thickness": "12mm",
        "Length": "150mm",
        "Width": "60mm"
      },
      compatibility: ["Honda Civic 2016-2021", "Toyota Camry 2015-2020", "Ford Focus 2012-2018"],
      warranty: "2 years or 50,000 miles",
      vendor: {
        businessName: "AutoParts Pro",
        rating: "4.8",
        totalSales: 156
      }
    };

    res.json(mockPart);
  } catch (error) {
    console.error("Error fetching part:", error);
    res.status(500).json({ message: "Failed to fetch part" });
  }
};

export const getPartReviewsHandler = async (req: Request, res: Response) => {
  try {
    const mockReviews = [
      {
        id: 1,
        rating: 5,
        title: "Excellent quality",
        comment: "These brake pads work great and are very quiet.",
        verified: true,
        createdAt: "2024-01-15T10:30:00Z",
        user: { firstName: "John", lastName: "D." }
      },
      {
        id: 2,
        rating: 4,
        title: "Good value",
        comment: "Good quality for the price. Installation was straightforward.",
        verified: true,
        createdAt: "2024-01-10T14:20:00Z",
        user: { firstName: "Sarah", lastName: "M." }
      }
    ];

    res.json(mockReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const getRelatedPartsHandler = async (req: Request, res: Response) => {
  try {
    const mockRelatedParts = [
      {
        id: 4,
        name: "Brake Rotor Set",
        brand: "Bosch",
        price: "145.99",
        stockQuantity: 12,
        images: []
      },
      {
        id: 5,
        name: "Brake Fluid",
        brand: "Castrol",
        price: "8.99",
        stockQuantity: 30,
        images: []
      }
    ];

    res.json(mockRelatedParts);
  } catch (error) {
    console.error("Error fetching related parts:", error);
    res.status(500).json({ message: "Failed to fetch related parts" });
  }
};