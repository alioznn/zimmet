"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api, endpoints } from "@/lib/api";
import { Location } from "@/types";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import toast from "react-hot-toast";

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  // Lokasyonları çek
  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => (await api.get(endpoints.locations)).data,
  });

  // Lokasyon oluşturma mutation
  const createLocationMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      return (await api.post(endpoints.locations, data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsCreateDialogOpen(false);
      setFormData({ name: "" });
      toast.success("Lokasyon başarıyla oluşturuldu!");
    },
    onError: () => {
      toast.error("Lokasyon oluşturulurken bir hata oluştu!");
    },
  });

  // Lokasyon güncelleme mutation
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string } }) => {
      return (await api.put(endpoints.location(id), data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setIsEditDialogOpen(false);
      setEditingLocation(null);
      setFormData({ name: "" });
      toast.success("Lokasyon başarıyla güncellendi!");
    },
    onError: () => {
      toast.error("Lokasyon güncellenirken bir hata oluştu!");
    },
  });

  // Lokasyon silme mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      return (await api.delete(endpoints.location(id))).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Lokasyon başarıyla silindi!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Lokasyon silinirken bir hata oluştu!";
      toast.error(message);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      createLocationMutation.mutate({ name: formData.name.trim() });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && editingLocation) {
      updateLocationMutation.mutate({ id: editingLocation.id, data: { name: formData.name.trim() } });
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({ name: location.name });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu lokasyonu silmek istediğinizden emin misiniz?")) {
      deleteLocationMutation.mutate(id);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lokasyon Yönetimi</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Depo lokasyonlarını yönetin ve yeni lokasyonlar ekleyin.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Lokasyon Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Lokasyon Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lokasyon Adı
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="Lokasyon adını girin"
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
                    disabled={createLocationMutation.isPending}
                    className="flex-1"
                  >
                    {createLocationMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lokasyonlar Listesi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Lokasyonlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
              </div>
            ) : locations && locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((location: Location) => (
                  <div key={location.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg text-gray-900 dark:text-white">{location.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">ID: {location.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(location)}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(location.id)}
                          className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">Henüz lokasyon bulunmuyor</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Yeni lokasyon eklemek için yukarıdaki butonu kullanın
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Düzenleme Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lokasyon Düzenle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lokasyon Adı
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Lokasyon adını girin"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={updateLocationMutation.isPending}
                  className="flex-1"
                >
                  {updateLocationMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
