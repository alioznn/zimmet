"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api, endpoints } from "@/lib/api";
import { CreateEmployeeForm } from "@/types";

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeForm>({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
  });

  // Verileri çek
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get(endpoints.employees)).data,
  });

  // Çalışan oluşturma mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: CreateEmployeeForm) => {
      return (await api.post(endpoints.employees, data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsCreateDialogOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", department: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.email && formData.department) {
      createEmployeeMutation.mutate(formData);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Çalışan Yönetimi</h1>
            <p className="mt-2 text-gray-600">
              Çalışanları görüntüleyin ve yeni çalışanlar ekleyin.
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Yeni Çalışan Ekle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Çalışan Oluştur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Ad"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Soyad"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departman
                  </label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Departman adı"
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
                    disabled={createEmployeeMutation.isPending}
                    className="flex-1"
                  >
                    {createEmployeeMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Çalışan Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Çalışan Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {employees?.length > 0 ? (
              <div className="space-y-4">
                {employees.map((employee: any) => (
                  <div key={employee.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">{employee.fullName}</h3>
                          <Badge variant="outline">{employee.department}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Henüz çalışan bulunmuyor. Yeni çalışan eklemek için yukarıdaki butonu kullanın.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
