const Product = require("../models/product.model");
const fs = require("fs");
const path = require("path");

// Lấy tất cả sản phẩm với phân trang và lọc
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Trích xuất tham số lọc
    const filters = {
      category_id: req.query.category_id,
      brand: req.query.brand,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      featured: req.query.featured === "true",
      status: req.query.status,
      search: req.query.search,
      sort: req.query.sort,
    };

    // Loại bỏ các bộ lọc không xác định
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const products = await Product.findAll(limit, offset, filters);
    const total = await Product.countAll(filters);

    res.json({
      status: "success",
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy một sản phẩm theo ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy một sản phẩm theo slug
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findBySlug(req.params.slug);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // Xử lý variants nếu có
    if (productData.variants && typeof productData.variants === "string") {
      try {
        productData.variants = JSON.parse(productData.variants);
      } catch (e) {
        return res.status(400).json({
          status: "error",
          message: "Định dạng variants không hợp lệ",
        });
      }
    }

    // Xử lý upload file qua Cloudinary
    if (req.file) {
      productData.image = req.file.path; // Cloudinary trả về URL trong req.file.path
    }

    // Chuyển đổi specifications thành JSON nếu là chuỗi
    if (
      productData.specifications &&
      typeof productData.specifications === "string"
    ) {
      try {
        productData.specifications = JSON.parse(productData.specifications);
      } catch (e) {
        return res.status(400).json({
          status: "error",
          message: "Định dạng thông số kỹ thuật không hợp lệ",
        });
      }
    }

    const productId = await Product.create(productData);

    res.status(201).json({
      status: "success",
      message: "Tạo sản phẩm thành công",
      data: {
        id: productId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // Lấy sản phẩm hiện tại để kiểm tra hình ảnh
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Xử lý upload file
    if (req.file) {
      // Xóa hình ảnh cũ nếu tồn tại
      if (existingProduct.image) {
        const oldImagePath = path.join(
          __dirname,
          "../uploads",
          existingProduct.image
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      productData.image = req.file.filename;
    }

    // Chuyển đổi specifications thành JSON nếu là chuỗi
    if (
      productData.specifications &&
      typeof productData.specifications === "string"
    ) {
      try {
        productData.specifications = JSON.parse(productData.specifications);
      } catch (e) {
        return res.status(400).json({
          status: "error",
          message: "Định dạng thông số kỹ thuật không hợp lệ",
        });
      }
    }

    const success = await Product.update(req.params.id, productData);

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm hoặc không có thay đổi",
      });
    }

    res.json({
      status: "success",
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    next(error);
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res, next) => {
  try {
    // Lấy sản phẩm hiện tại để kiểm tra hình ảnh
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Xóa hình ảnh từ Cloudinary nếu có
    if (existingProduct.image) {
      // Lấy public_id từ URL Cloudinary
      const publicId = existingProduct.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Xóa hình ảnh gallery từ Cloudinary nếu có
    if (existingProduct.images) {
      const images = JSON.parse(existingProduct.images)
      for (const imageUrl of images) {
        const publicId = imageUrl.split('/').pop().split('.')[0]
        await cloudinary.uploader.destroy(publicId)
      }
    }

    const success = await Product.delete(req.params.id);

    if (!success) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json({
      status: "success",
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    next(error);
  }
};

// Upload nhiều hình ảnh cho gallery sản phẩm
exports.uploadGallery = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Không có file nào được tải lên",
      });
    }

    // Lấy sản phẩm hiện tại
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Lấy hình ảnh gallery hiện tại
    let images = [];
    if (existingProduct.images) {
      try {
        images = JSON.parse(existingProduct.images);
      } catch (e) {
        images = [];
      }
    }

    // Thêm hình ảnh mới vào gallery (URLs từ Cloudinary)
    const newImages = req.files.map((file) => file.path);
    images = [...images, ...newImages];

    // Cập nhật sản phẩm với gallery mới
    const success = await Product.update(req.params.id, {
      images: JSON.stringify(images),
    });

    if (!success) {
      return res.status(500).json({
        status: "error",
        message: "Không thể cập nhật gallery sản phẩm",
      });
    }

    res.json({
      status: "success",
      message: "Upload gallery thành công",
      data: {
        images: newImages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Tìm kiếm sản phẩm
exports.searchProducts = async (req, res, next) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res.status(400).json({
        status: "error",
        message: "Từ khóa tìm kiếm là bắt buộc",
      });
    }

    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const products = await Product.search(keyword, limit, offset);


    res.json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy sản phẩm liên quan
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy sản phẩm",
      });
    }

    const relatedProducts = await Product.getRelatedProducts(
      req.params.id,
      product.category_id,
      Number.parseInt(req.query.limit) || 4
    );


    res.json({
      status: "success",
      data: {
        products: relatedProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy sản phẩm nổi bật
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const featuredProducts = await Product.getFeaturedProducts(
      Number.parseInt(req.query.limit) || 8
    );

    res.json({
      status: "success",
      data: {
        products: featuredProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy sản phẩm mới
exports.getNewArrivals = async (req, res, next) => {
  try {
    const newArrivals = await Product.getNewArrivals(
      Number.parseInt(req.query.limit) || 8
    );

    res.json({
      status: "success",
      data: {
        products: newArrivals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy sản phẩm bán chạy
exports.getBestSellers = async (req, res, next) => {
  try {
    const bestSellers = await Product.getBestSellers(
      Number.parseInt(req.query.limit) || 8
    );

    res.json({
      status: "success",
      data: {
        products: bestSellers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Thêm phương thức để lấy sản phẩm theo loại
exports.getProductsByType = async (req, res, next) => {
  try {
    const type = req.params.type;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!["phone", "laptop", "accessory"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Loại sản phẩm không hợp lệ",
      });
    }

    const products = await Product.findByType(type, limit, offset);
    const total = await Product.countByType(type);

    res.json({
      status: "success",
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
