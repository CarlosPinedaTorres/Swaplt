import { View, Text, FlatList, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { getUserOperations } from '../services/Offers/offerService';
import { colors } from '../Styles/Colors';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { useAuthStore } from '../store/useAuthStore';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Operation } from '../types/Product';
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from '../Styles/Fonts';
const statusColors: Record<string, string> = {
  PENDING: colors.estadoPendiente,
  ACCEPTED: colors.estadoAceptado,
  PAYMENT_PENDING: colors.estadoPagoPendiente,
  PAID: colors.estadoPagado,
  COMPLETED: colors.estadoCompletado,
  REJECTED: colors.estadoRechazado,
  CANCELLED: colors.estadoCancelado,
};

export type RootStackParamList = {
  Ofertas: undefined;
  DetailsOffer: { offer: Operation };
};

export default function Ofertas() {
  const statusMap: Record<string, string> = {
    PENDING: "Pendiente",
    ACCEPTED: "Aceptado",
    PAYMENT_PENDING: "Pago pendiente",
    PAID: "Pagado",
    COMPLETED: "Completado",
    REJECTED: "Rechazado",
    CANCELLED: "Cancelado",
  };


  const userIdActual = Number(useAuthStore((state) => state.user?.id));
  const [allOperations, setAllOperations] = useState<any[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [groupedOperations, setGroupedOperations] = useState<Record<string, any[]>>({});

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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

  useFocusEffect(
    useCallback(() => {
      fetchOperations();
    }, [])
  );

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
  const renderItem = ({ item }: { item: any }) => {
    const isSale = item.type === "SALE";
    const itemBackgroundColor = isSale ? colors.ofertaMonetaria : colors.ofertaIntercambio;

    return (
      <Pressable
        onPress={() => navigation.navigate("DetailsOffer", { offer: item })}
        style={({ pressed }) => [
          styles.itemContainer,
          { backgroundColor: itemBackgroundColor },
          pressed && { transform: [{ scale: 0.98 }] }
        ]}
      >
        <Text style={styles.title}>
          {isSale ? "Oferta Monetaria" : "Intercambio"}
        </Text>
        <Text style={styles.itemText}>Producto: {item.mainProduct?.nombre}</Text>
        {item.moneyOffered && <Text style={styles.itemText}>Monto ofrecido: {item.moneyOffered} €</Text>}
        {item.offeredProducts?.length > 0 && (
          <Text style={styles.itemText}>
            Productos ofrecidos: {item.offeredProducts.map((p: any) => p.product.nombre).join(", ")}
          </Text>
        )}
        <Text style={[styles.itemText, { color: statusColors[item.status] || "#000" }]}>
          Estado: {statusMap[item.status] || item.status} | Solicitante: {item.requester?.nombre} | Receptor: {item.receiver?.nombre}
        </Text>
      </Pressable>
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filtrar por rol:</Text>
          <Picker
            selectedValue={roleFilter}
            onValueChange={(value: any) => setRoleFilter(value)}
          >
            <Picker.Item label="Todos" value="all" />
            <Picker.Item label="Comprador" value="buyer" />
            <Picker.Item label="Vendedor" value="seller" />
          </Picker>

          <Text style={styles.filterLabel}>Filtrar por mes:</Text>
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

          <Text style={styles.filterLabel}>Filtrar por estado:</Text>
          <Picker
            selectedValue={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <Picker.Item label="Todos" value="all" />
            <Picker.Item label="Pendiente" value="PENDING" />
            <Picker.Item label="Pago pendiente" value="PAYMENT_PENDING" />
            <Picker.Item label="Pagado" value="PAID" />
            <Picker.Item label="Completado" value="COMPLETED" />
            <Picker.Item label="Rechazado" value="REJECTED" />
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
                    <Text style={styles.monthTitle}>
                      {monthNames[Number(month) - 1]} {year}
                    </Text>

                    {groupedOperations[monthKey].map(item => {
                      const isSale = item.type === "SALE";
                      const itemBackgroundColor = isSale ? colors.ofertaMonetaria : colors.ofertaIntercambio;

                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => navigation.navigate('DetailsOffer', { offer: item })}
                          style={({ pressed }) => [
                            styles.itemContainer,
                            { backgroundColor: itemBackgroundColor },
                            pressed && { transform: [{ scale: 0.98 }] }
                          ]}
                        >
                          <Text style={styles.title}>
                            {isSale ? 'Oferta Monetaria' : 'Intercambio'}
                          </Text>
                          <Text style={styles.itemText}>Producto: {item.mainProduct?.nombre}</Text>
                          {item.moneyOffered && <Text style={styles.itemText}>Monto ofrecido: {item.moneyOffered} €</Text>}
                          {item.offeredProducts?.length > 0 && (
                            <Text style={styles.itemText}>
                              Productos ofrecidos: {item.offeredProducts.map((p: any) => p.product.nombre).join(", ")}
                            </Text>
                          )}
                          <Text style={[styles.itemText, { color: statusColors[item.status] || "#000" }]}>
                            Estado: {statusMap[item.status] || item.status} | Solicitante: {item.requester?.nombre} | Receptor: {item.receiver?.nombre}
                          </Text>
                        </Pressable>
                      );
                    })}
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
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: RFPercentage(2) }}
            />
          )
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  container: {
    flex: 1,
    padding: RFValue(12),
    backgroundColor: colors.fondo,
    justifyContent: 'flex-start',

    minHeight: '100%',
  },


  itemContainer: {
    backgroundColor: colors.fondoSecundario,
    padding: RFPercentage(2),
    borderRadius: RFPercentage(2.5),
    marginBottom: RFPercentage(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
  },
  filterContainer: {
    backgroundColor: colors.fondoSecundario,
    borderRadius: RFPercentage(1),
    padding: RFPercentage(1),
    marginBottom: RFPercentage(1.2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexShrink: 0,
  },


  filterLabel: {
    fontSize: fonts.small,
    fontWeight: 'bold',
    marginBottom: RFPercentage(0.8),
  },
  title: {
    fontSize: fonts.large,
    fontWeight: 'bold',
    marginBottom: RFPercentage(0.8),

  },
  itemText: {
    fontSize: fonts.small,
    marginBottom: RFPercentage(0.5),

  },
  monthTitle: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    marginBottom: RFPercentage(1),
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
