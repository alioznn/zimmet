"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, endpoints } from "@/lib/api";
import { CreateAssignmentForm } from "@/types";
import { CustomSelect } from "@/components/ui/custom-select";
import toast from "react-hot-toast";

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateAssignmentForm>({
    itemId: 0,
    employeeId: 0,
    quantity: 1,
  });

  // Verileri çek
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

  // Zimmet oluşturma mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: CreateAssignmentForm) => {
      return (await api.post(endpoints.assignments, data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["activeAssignments"] });
      setFormData({ itemId: 0, employeeId: 0, quantity: 1 });
    },
  });

  // İade alma mutation
  const returnAssignmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return (await api.post(endpoints.returnAssignment(id))).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["activeAssignments"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.itemId && formData.employeeId && formData.quantity > 0) {
      createAssignmentMutation.mutate(formData);
    }
  };

  const handleReturn = (id: number) => {
    if (confirm("Bu zimmeti iade almak istediğinizden emin misiniz?")) {
      returnAssignmentMutation.mutate(id);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Zimmet Yönetimi</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Çalışanlara zimmet oluşturun ve mevcut zimmetleri yönetin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Zimmet Oluşturma */}
          <Card>
            <CardHeader>
              <CardTitle>Yeni Zimmet Oluştur</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ürün Seçin
                  </label>
                  <CustomSelect
                    options={[
                      { value: "0", label: "Ürün seçin" },
                      ...(items?.map((item: any) => ({
                        value: item.id.toString(),
                        label: `${item.name} (SKU: ${item.sku}) - Elde: ${item.quantityOnHand}`
                      })) || [])
                    ]}
                    value={formData.itemId.toString()}
                    onChange={(value) => setFormData({ ...formData, itemId: Number(value) })}
                    placeholder="Ürün seçin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Çalışan Seçin
                  </label>
                  <CustomSelect
                    options={[
                      { value: "0", label: "Çalışan seçin" },
                      ...(employees?.map((employee: any) => ({
                        value: employee.id.toString(),
                        label: `${employee.fullName} - ${employee.department}`
                      })) || [])
                    ]}
                    value={formData.employeeId.toString()}
                    onChange={(value) => setFormData({ ...formData, employeeId: Number(value) })}
                    placeholder="Çalışan seçin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Miktar
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createAssignmentMutation.isPending || !formData.itemId || !formData.employeeId}
                  className="w-full"
                >
                  {createAssignmentMutation.isPending ? "Oluşturuluyor..." : "Zimmet Oluştur"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Aktif Zimmetler */}
          <Card>
            <CardHeader>
              <CardTitle>Aktif Zimmetler</CardTitle>
            </CardHeader>
            <CardContent>
              {activeAssignments?.length > 0 ? (
                <div className="space-y-4">
                  {activeAssignments.map((assignment: any) => (
                    <div key={assignment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{assignment.item}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{assignment.employee}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{assignment.quantity} adet</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(assignment.assignedAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturn(assignment.id)}
                          disabled={returnAssignmentMutation.isPending}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {returnAssignmentMutation.isPending ? "İşleniyor..." : "İade Al"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                  Henüz aktif zimmet bulunmuyor.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
