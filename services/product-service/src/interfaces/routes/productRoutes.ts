import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { ProductService } from '../../application/services/ProductService';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';

const router = Router();

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get('/', productController.getAll);

router.get('/:id', productController.getById);

router.post('/', productController.create);

router.put('/:id', productController.update);

router.delete('/:id', productController.delete);

export default router;
