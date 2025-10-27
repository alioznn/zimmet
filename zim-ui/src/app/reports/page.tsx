"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, endpoints } from "@/lib/api";
import { FileText, Download, Calendar, BarChart3, Users, Package } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Verileri çek
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: async () => (await api.get(endpoints.items)).data,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get(endpoints.employees)).data,
  });

  const { data: assignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => (await api.get(endpoints.assignments)).data,
  });

  const { data: activeAssignments } = useQuery({
    queryKey: ["activeAssignments"],
    queryFn: async () => (await api.get(endpoints.activeAssignments)).data,
  });

  // Excel export fonksiyonu
  const exportToExcel = (data: any[], filename: string, sheetName: string) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(dataBlob, `${filename}.xlsx`);
      toast.success(`${filename} raporu başarıyla indirildi!`);
    } catch (error) {
      toast.error("Rapor indirilirken bir hata oluştu!");
    }
  };

  // Stok raporu
  const generateStockReport = () => {
    if (!items) return;
    
    const stockData = items.map((item: any) => ({
      'Ürün Adı': item.name,
      'SKU': item.sku,
      'Kategori': item.category,
      'Lokasyon': item.location || 'Belirtilmemiş',
      'Elde Stok': item.quantityOnHand,
      'Zimmetli': item.quantityAssigned,
      'Toplam': item.quantityOnHand + item.quantityAssigned,
      'Stok Durumu': item.quantityOnHand < 5 ? 'Düşük' : item.quantityOnHand === 0 ? 'Tükendi' : 'Normal'
    }));

    exportToExcel(stockData, 'Stok_Raporu', 'Stok Durumu');
  };

  // Zimmet raporu
  const generateAssignmentReport = () => {
    if (!assignments) return;
    
    const assignmentData = assignments.map((assignment: any) => ({
      'Zimmet ID': assignment.id,
      'Ürün': assignment.itemName,
      'Çalışan': assignment.employeeName,
      'Miktar': assignment.quantity,
      'Durum': assignment.status === 1 ? 'Aktif' : 'İade Edildi',
      'Zimmet Tarihi': new Date(assignment.assignedAt).toLocaleDateString('tr-TR'),
      'İade Tarihi': assignment.returnedAt ? new Date(assignment.returnedAt).toLocaleDateString('tr-TR') : '-'
    }));

    exportToExcel(assignmentData, 'Zimmet_Raporu', 'Zimmet Hareketleri');
  };

  // Çalışan raporu
  const generateEmployeeReport = () => {
    if (!employees || !activeAssignments) return;
    
    const employeeData = employees.map((employee: any) => {
      const employeeAssignments = activeAssignments.filter((assignment: any) => 
        assignment.employee === `${employee.firstName} ${employee.lastName}`
      );
      
      return {
        'Çalışan ID': employee.id,
        'Ad Soyad': `${employee.firstName} ${employee.lastName}`,
        'Email': employee.email,
        'Departman': employee.department,
        'Aktif Zimmet Sayısı': employeeAssignments.length,
        'Toplam Zimmetli Ürün': employeeAssignments.reduce((sum: number, assignment: any) => sum + assignment.quantity, 0)
      };
    });

    exportToExcel(employeeData, 'Çalışan_Raporu', 'Çalışan Bilgileri');
  };

  // Kapsamlı rapor
  const generateComprehensiveReport = () => {
    if (!items || !employees || !assignments) return;
    
    const comprehensiveData = {
      'Genel İstatistikler': [
        { 'Metrik': 'Toplam Ürün Sayısı', 'Değer': items.length },
        { 'Metrik': 'Toplam Çalışan Sayısı', 'Değer': employees.length },
        { 'Metrik': 'Toplam Zimmet Sayısı', 'Değer': assignments.length },
        { 'Metrik': 'Aktif Zimmet Sayısı', 'Değer': activeAssignments?.length || 0 },
        { 'Metrik': 'Toplam Stok Miktarı', 'Değer': items.reduce((sum: number, item: any) => sum + item.quantityOnHand, 0) },
        { 'Metrik': 'Toplam Zimmetli Miktar', 'Değer': items.reduce((sum: number, item: any) => sum + item.quantityAssigned, 0) }
      ]
    };

    exportToExcel(comprehensiveData['Genel İstatistikler'], 'Kapsamlı_Rapor', 'Genel İstatistikler');
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Raporlar</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Sistem verilerini Excel formatında indirin ve analiz edin.
            </p>
          </motion.div>
        </div>

        {/* Tarih Filtreleri */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Tarih Filtreleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Başlangıç Tarihi
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bitiş Tarihi
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rapor Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stok Raporu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Stok Raporu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Tüm ürünlerin stok durumunu içeren detaylı rapor.
                </p>
                <Button 
                  onClick={generateStockReport}
                  className="w-full"
                  disabled={!items}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel İndir
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Zimmet Raporu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Zimmet Raporu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Tüm zimmet hareketlerini içeren detaylı rapor.
                </p>
                <Button 
                  onClick={generateAssignmentReport}
                  className="w-full"
                  disabled={!assignments}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel İndir
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Çalışan Raporu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Çalışan Raporu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Çalışan bilgileri ve zimmet durumlarını içeren rapor.
                </p>
                <Button 
                  onClick={generateEmployeeReport}
                  className="w-full"
                  disabled={!employees}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel İndir
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Kapsamlı Rapor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="md:col-span-2 lg:col-span-3"
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                  Kapsamlı Rapor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Tüm sistem verilerini içeren genel istatistik raporu.
                </p>
                <Button 
                  onClick={generateComprehensiveReport}
                  className="w-full md:w-auto"
                  disabled={!items || !employees || !assignments}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Kapsamlı Excel Raporu İndir
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Rapor Bilgileri */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Rapor Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Mevcut Veriler</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• {items?.length || 0} ürün kaydı</li>
                  <li>• {employees?.length || 0} çalışan kaydı</li>
                  <li>• {assignments?.length || 0} zimmet kaydı</li>
                  <li>• {activeAssignments?.length || 0} aktif zimmet</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Rapor Özellikleri</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Excel (.xlsx) formatında</li>
                  <li>• Türkçe başlıklar</li>
                  <li>• Tarih formatları Türkçe</li>
                  <li>• Anında indirme</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
