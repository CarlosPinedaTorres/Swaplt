import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { getUserOperations } from '../services/Offers/offerService';
import { colors } from '../Styles/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import { useAuthStore } from '../store/useAuthStore';

export default function Ofertas() {
  const userIdActual = Number(useAuthStore((state) => state.user?.id));
  const [allOperations, setAllOperations] = useState<any[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [groupedOperations, setGroupedOperations] = useState<Record<string, any[]>>({});

  const groupByMonth = (operations: any[]) => {
    const groups: Record<string, any[]> = {};
    operations.forEach(op => {
      const key = new Date(op.createdAt).toISOString().slice(0, 7);
      if (!groups[key]) groups[key] = [];
      groups[key].push(op);
    });
    return groups;
  };

  const fetchOperations = async () => {
    try {
      const data = await getUserOperations();
      setAllOperations(data);
      setFilteredOperations(data);

      const months = Array.from<string>(
        new Set(data.map((op: any) =>
          new Date(op.createdAt).toISOString().slice(0, 7)
        ))
      ).sort().reverse();

      setAvailableMonths(months);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  useEffect(() => {
    let ops = [...allOperations];

    if (roleFilter !== 'all') {
      ops = ops.filter(op =>
        roleFilter === 'buyer'
          ? op.requesterId === userIdActual
          : op.receiverId === userIdActual
      );
    }

    if (statusFilter !== 'all') {
      ops = ops.filter(op => op.status === statusFilter);
    }

    if (monthFilter !== 'all') {
      const [year, month] = monthFilter.split('-').map(Number);
      ops = ops.filter(op => {
        const date = new Date(op.updatedAt);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });
    }

    setFilteredOperations(ops);

    if (monthFilter === "all") {
      const groups = groupByMonth(ops);
      const sortedKeys = Object.keys(groups).sort().reverse();
      const ordered = sortedKeys.reduce((acc, key) => {
        acc[key] = groups[key];
        return acc;
      }, {} as Record<string, any[]>);
      setGroupedOperations(ordered);
    } else {
      setGroupedOperations({});
    }
  }, [roleFilter, statusFilter, monthFilter, allOperations]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.title}>
        {item.type === 'SALE' ? 'Oferta Monetaria' : 'Intercambio'}
      </Text>
      <Text>Producto: {item.mainProduct?.nombre}</Text>
      {item.moneyOffered && <Text>Monto ofrecido: {item.moneyOffered} €</Text>}
      {item.offeredProducts?.length > 0 && (
        <Text>
          Productos ofrecidos: {item.offeredProducts.map((p: any) => p.product.nombre).join(', ')}
        </Text>
      )}
      <Text>
        Estado: {item.status} | Solicitante: {item.requester?.nombre} | Receptor: {item.receiver?.nombre}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando operaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={{ marginBottom: RFValue(12) }}>
        <Text>Filtrar por rol:</Text>
        <Picker
          selectedValue={roleFilter}
          onValueChange={(value: any) => setRoleFilter(value)}
        >
          <Picker.Item label="Todos" value="all" />
          <Picker.Item label="Comprador" value="buyer" />
          <Picker.Item label="Vendedor" value="seller" />
        </Picker>

        <Text>Filtrar por mes:</Text>
        <Picker
          selectedValue={monthFilter}
          onValueChange={(value) => setMonthFilter(value)}
        >
          <Picker.Item label="Todos" value="all" />
          {availableMonths.map((m) => {
            const [year, month] = m.split("-");
            const monthNames = [
              "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            return (
              <Picker.Item
                key={m}
                label={`${monthNames[Number(month) - 1]} ${year}`}
                value={m}
              />
            );
          })}
        </Picker>

        <Text>Filtrar por estado:</Text>
        <Picker
          selectedValue={statusFilter}
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <Picker.Item label="Todos" value="all" />
          <Picker.Item label="Pendiente" value="PENDING" />
          <Picker.Item label="Aceptado" value="ACCEPTED" />
          <Picker.Item label="Pago pendiente" value="PAYMENT_PENDING" />
          <Picker.Item label="Pagado" value="PAID" />
          <Picker.Item label="Completado" value="COMPLETED" />
          <Picker.Item label="Rechazado" value="REJECTED" />
          <Picker.Item label="Cancelado" value="CANCELLED" />
        </Picker>
      </View>

      {monthFilter === "all" ? (
        <ScrollView style={{ flex: 1 }}>
          {Object.keys(groupedOperations).length === 0 ? (
            <Text>No hay operaciones</Text>
          ) : (
            Object.keys(groupedOperations).map(monthKey => {
              const [year, month] = monthKey.split("-");
              const monthNames = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
              ];

              return (
                <View key={monthKey} style={{ marginBottom: 25 }}>
                  <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
                    {monthNames[Number(month) - 1]} {year}
                  </Text>

                  {groupedOperations[monthKey].map(item => (
                    <View key={item.id} style={styles.itemContainer}>
                      <Text style={styles.title}>
                        {item.type === 'SALE' ? 'Oferta Monetaria' : 'Intercambio'}
                      </Text>
                      <Text>Producto: {item.mainProduct?.nombre}</Text>
                      {item.moneyOffered && <Text>Monto ofrecido: {item.moneyOffered} €</Text>}
                      {item.offeredProducts?.length > 0 && (
                        <Text>
                          Productos ofrecidos: {item.offeredProducts.map((p: any) => p.product.nombre).join(", ")}
                        </Text>
                      )}
                      <Text>
                        Estado: {item.status} | Solicitante: {item.requester?.nombre} | Receptor: {item.receiver?.nombre}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        filteredOperations.length === 0 ? (
          <Text>No tienes operaciones con estos filtros</Text>
        ) : (
          <FlatList
            data={filteredOperations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        )
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: RFValue(12), backgroundColor: colors.fondo },
  itemContainer: {
    backgroundColor: colors.fondoSecundario,
    padding: RFValue(12),
    borderRadius: 8,
    marginBottom: RFValue(10),
  },
  title: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginBottom: RFValue(4),
  },
});
