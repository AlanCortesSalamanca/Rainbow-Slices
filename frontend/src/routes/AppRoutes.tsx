import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AppLayout } from '../components/AppLayout';
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
import { LoginPage } from '../pages/LoginPage/LoginPage';

function protectedPage(page: ReactNode) {
  return (
    <ProtectedRoute>
      <AppLayout>{page}</AppLayout>
    </ProtectedRoute>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/products" element={protectedPage(<ProductsPage />)} />
      <Route path="/products/new" element={protectedPage(<ProductFormPage />)} />
      <Route path="/products/:id" element={protectedPage(<ProductDetailPage />)} />
      <Route path="/products/:id/edit" element={protectedPage(<ProductFormPage />)} />
      <Route path="/ingredients" element={protectedPage(<IngredientsPage />)} />
      <Route path="/ingredients/new" element={protectedPage(<IngredientFormPage />)} />
      <Route path="/ingredients/:id/edit" element={protectedPage(<IngredientFormPage />)} />
      <Route path="/recipes" element={protectedPage(<RecipesPage />)} />
      <Route path="/production" element={protectedPage(<ProductionPage />)} />
      <Route path="/inventory/finished" element={protectedPage(<FinishedInventoryPage />)} />
      <Route path="/orders" element={protectedPage(<OrdersPage />)} />
      <Route path="/orders/new" element={protectedPage(<OrderFormPage />)} />
      <Route path="/orders/:id" element={protectedPage(<OrderDetailPage />)} />
      <Route path="/orders/:id/edit" element={protectedPage(<OrderFormPage />)} />
      <Route path="/expenses" element={protectedPage(<ExpensesPage />)} />
      <Route path="/reports" element={protectedPage(<ReportsPage />)} />
    </Routes>
  );
}
