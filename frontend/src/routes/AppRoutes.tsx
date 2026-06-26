import { Navigate, Route, Routes } from 'react-router-dom';
import { ExpensesPage } from '../pages/ExpensesPage';
import { FinishedInventoryPage } from '../pages/FinishedInventoryPage';
import { IngredientFormPage } from '../pages/IngredientFormPage';
import { IngredientsPage } from '../pages/IngredientsPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { OrderFormPage } from '../pages/OrderFormPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductionPage } from '../pages/ProductionPage';
import { RecipesPage } from '../pages/RecipesPage';
import { ReportsPage } from '../pages/ReportsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/new" element={<ProductFormPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/products/:id/edit" element={<ProductFormPage />} />
      <Route path="/ingredients" element={<IngredientsPage />} />
      <Route path="/ingredients/new" element={<IngredientFormPage />} />
      <Route path="/ingredients/:id/edit" element={<IngredientFormPage />} />
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/production" element={<ProductionPage />} />
      <Route path="/inventory/finished" element={<FinishedInventoryPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/new" element={<OrderFormPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/orders/:id/edit" element={<OrderFormPage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Routes>
  );
}
