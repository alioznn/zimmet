"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Users, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  // Dashboard verilerini çek
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: async () => (await api.get(endpoints.items)).data,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get(endpoints.employees)).data,
  });

  const { data: activeAssignments } = useQuery({
    queryKey: ["activeAssignments"],
    queryFn: async () => (await api.get(endpoints.activeAssignments)).data,
  });

  // İstatistikleri hesapla
  const totalItems = items?.length || 0;
  const totalEmployees = employees?.length || 0;
  const totalAssigned = items?.reduce((sum: number, item: any) => sum + item.quantityAssigned, 0) || 0;
  const totalOnHand = items?.reduce((sum: number, item: any) => sum + item.quantityOnHand, 0) || 0;
  const activeAssignmentsCount = activeAssignments?.length || 0;

  // Stok uyarıları (5'ten az stok)
  const lowStockItems = items?.filter((item: any) => item.quantityOnHand < 5) || [];
  
  // Kategori bazında stok dağılımı
  const categoryData = items?.reduce((acc: any, item: any) => {
    const category = item.category || 'Diğer';
    if (!acc[category]) {
      acc[category] = { name: category, onHand: 0, assigned: 0 };
    }
    acc[category].onHand += item.quantityOnHand;
    acc[category].assigned += item.quantityAssigned;
    return acc;
  }, {}) || {};

  const categoryChartData = Object.values(categoryData);

  // Stok durumu pie chart verisi
  const stockStatusData = [
    { name: 'Elde Stok', value: totalOnHand, color: '#10b981' },
    { name: 'Zimmetli', value: totalAssigned, color: '#f59e0b' },
  ];

  // Son 7 günlük zimmet hareketleri (örnek veri)
  const weeklyData = [
    { name: 'Pzt', zimmet: 3, iade: 1 },
    { name: 'Sal', zimmet: 5, iade: 2 },
    { name: 'Çar', zimmet: 2, iade: 4 },
    { name: 'Per', zimmet: 7, iade: 3 },
    { name: 'Cum', zimmet: 4, iade: 2 },
    { name: 'Cmt', zimmet: 1, iade: 1 },
    { name: 'Paz', zimmet: 2, iade: 0 },
  ];

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Zimmet uygulamasına hoş geldiniz. Depo durumunu ve zimmet bilgilerini buradan takip edebilirsiniz.
          </p>
        </motion.div>

        {/* İstatistik Kartları */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Toplam Ürün</CardTitle>
                <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{totalItems}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Kayıtlı ürün sayısı
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Toplam Çalışan</CardTitle>
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-green-600">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Kayıtlı çalışan sayısı
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Elde Stok</CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-emerald-600">{totalOnHand}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Depoda mevcut adet
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Zimmetli</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold text-amber-600">{totalAssigned}</div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Zimmetli toplam adet
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Stok Uyarıları */}
        {lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Stok Uyarıları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">{item.quantityOnHand} adet</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Kritik seviye</p>
                      </div>
                    </div>
                  ))}
        </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Grafikler */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {/* Haftalık Zimmet Hareketleri */}
          <Card>
            <CardHeader>
              <CardTitle>Haftalık Zimmet Hareketleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="zimmet" fill="#3b82f6" name="Zimmet" />
                  <Bar dataKey="iade" fill="#ef4444" name="İade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stok Durumu */}
          <Card>
            <CardHeader>
              <CardTitle>Stok Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Kategori Bazında Stok Dağılımı */}
        {categoryChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Kategori Bazında Stok Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="onHand" fill="#10b981" name="Elde Stok" />
                    <Bar dataKey="assigned" fill="#f59e0b" name="Zimmetli" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Son Aktif Zimmetler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Aktif Zimmetler
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAssignmentsCount > 0 ? (
                <div className="space-y-4">
                  {activeAssignments?.slice(0, 5).map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">{assignment.item}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{assignment.employee}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{assignment.quantity} adet</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(assignment.assignedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activeAssignmentsCount > 5 && (
                    <div className="text-center pt-4 border-t">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        ve {activeAssignmentsCount - 5} zimmet daha...
                      </p>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                        Tümünü Görüntüle →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Henüz aktif zimmet bulunmuyor</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Yeni zimmet oluşturmak için assignments sayfasını ziyaret edin</p>
    </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}