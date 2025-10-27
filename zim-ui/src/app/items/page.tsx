"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api, endpoints } from "@/lib/api";
import { CreateItemForm } from "@/types";
import { Search, Filter, Package, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/ui/custom-select";

export default function ItemsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateItemForm>({
    name: "",
    sku: "",
    categoryId: 0,
    locationId: null,
    quantityOnHand: 0,
  });

  // Arama ve filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  // Verileri çek
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: async () => (await api.get(endpoints.items)).data,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get(endpoints.categories)).data,
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => (await api.get(endpoints.locations)).data,
  });

  // Ürün oluşturma mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: CreateItemForm) => {
      return (await api.post(endpoints.items, data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setIsCreateDialogOpen(false);
      setFormData({ name: "", sku: "", categoryId: 0, locationId: null, quantityOnHand: 0 });
      toast.success("Ürün başarıyla oluşturuldu!");
    },
    onError: () => {
      toast.error("Ürün oluşturulurken bir hata oluştu!");
    },
  });

  // Filtrelenmiş ürünler
  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter((item: any) => {
      // Arama terimi kontrolü
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

      // Kategori filtresi
      const matchesCategory = selectedCategory === "all" || 
        item.category === selectedCategory;

      // Lokasyon filtresi
      const matchesLocation = selectedLocation === "all" || 
        item.location === selectedLocation;

      // Stok filtresi
      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = item.quantityOnHand < 5;
      } else if (stockFilter === "out") {
        matchesStock = item.quantityOnHand === 0;
      } else if (stockFilter === "available") {
        matchesStock = item.quantityOnHand > 0;
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesStock;
    });
  }, [items, searchTerm, selectedCategory, selectedLocation, stockFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.sku && formData.categoryId > 0 && formData.quantityOnHand >= 0) {
      createItemMutation.mutate(formData);
    } else {
      toast.error("Lütfen tüm gerekli alanları doldurun!");
    }
  };

  return (
    <AppLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
            <p className="mt-2 text-gray-600">
              Depodaki ürünleri görüntüleyin ve yeni ürünler ekleyin.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Yeni Ürün Ekle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Ürün Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ürün Adı
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ürün adını girin"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU
                  </label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="Stok kodu girin"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori
                  </label>
                  <CustomSelect
                    options={[
                      { value: "0", label: "Kategori seçin" },
                      ...(categories?.map((category: any) => ({
                        value: category.id.toString(),
                        label: category.name
                      })) || [])
                    ]}
                    value={formData.categoryId.toString()}
                    onChange={(value) => setFormData({ ...formData, categoryId: Number(value) })}
                    placeholder="Kategori seçin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lokasyon (Opsiyonel)
                  </label>
                  <CustomSelect
                    options={[
                      { value: "", label: "Lokasyon seçin" },
                      ...(locations?.map((location: any) => ({
                        value: location.id.toString(),
                        label: location.name
                      })) || [])
                    ]}
                    value={formData.locationId?.toString() || ""}
                    onChange={(value) => setFormData({ ...formData, locationId: value ? Number(value) : null })}
                    placeholder="Lokasyon seçin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Başlangıç Stoku
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantityOnHand}
                    onChange={(e) => setFormData({ ...formData, quantityOnHand: Number(e.target.value) })}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={createItemMutation.isPending}
                    className="flex-1"
                  >
                    {createItemMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Arama ve Filtreleme */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Arama ve Filtreleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Arama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ürün Ara
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Ürün adı veya SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Kategori Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori
                </label>
                <CustomSelect
                  options={[
                    { value: "all", label: "Tüm Kategoriler" },
                    ...(categories?.map((category: any) => ({
                      value: category.name,
                      label: category.name
                    })) || [])
                  ]}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Kategori seçin"
                />
              </div>

              {/* Lokasyon Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lokasyon
                </label>
                <CustomSelect
                  options={[
                    { value: "all", label: "Tüm Lokasyonlar" },
                    ...(locations?.map((location: any) => ({
                      value: location.name,
                      label: location.name
                    })) || [])
                  ]}
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  placeholder="Lokasyon seçin"
                />
              </div>

              {/* Stok Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stok Durumu
                </label>
                <CustomSelect
                  options={[
                    { value: "all", label: "Tümü" },
                    { value: "available", label: "Mevcut" },
                    { value: "low", label: "Düşük Stok (<5)" },
                    { value: "out", label: "Stok Yok" }
                  ]}
                  value={stockFilter}
                  onChange={setStockFilter}
                  placeholder="Stok durumu seçin"
                />
              </div>
            </div>

            {/* Filtre Sonuçları */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {filteredItems.length} ürün bulundu
                {searchTerm && ` (${searchTerm} için arama)`}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedLocation("all");
                  setStockFilter("all");
                }}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ürün Listesi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Ürün Listesi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map((item: any) => (
                  <div key={item.id} className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    item.quantityOnHand < 5 ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg text-gray-900 dark:text-white">{item.name}</h3>
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{item.sku}</Badge>
                          {item.quantityOnHand < 5 && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Düşük Stok
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.category} {item.location && `• ${item.location}`}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Elde:</span>
                            <Badge variant={item.quantityOnHand === 0 ? "destructive" : "secondary"}>
                              {item.quantityOnHand}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Zimmetli:</span>
                            <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{item.quantityAssigned}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Toplam:</span>
                            <Badge className="bg-blue-600 text-white">{item.quantityOnHand + item.quantityAssigned}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {searchTerm || selectedCategory !== "all" || selectedLocation !== "all" || stockFilter !== "all"
                    ? "Arama kriterlerinize uygun ürün bulunamadı"
                    : "Henüz ürün bulunmuyor"}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  {searchTerm || selectedCategory !== "all" || selectedLocation !== "all" || stockFilter !== "all"
                    ? "Filtreleri değiştirerek tekrar deneyin"
                    : "Yeni ürün eklemek için yukarıdaki butonu kullanın"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
