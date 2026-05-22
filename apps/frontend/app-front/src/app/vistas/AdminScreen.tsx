import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  FlatList, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useUserVM } from '../../presentation/viewmodel/UserVM';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SBColors, SBSpacing, SBRadius, SBFonts, hapticLight, useAlert, ConfirmModal, ThemedButton } from '../../presentation/theme';
import { User } from '../../domain/entities/user';

export default function AdminScreen() {
  const router = useRouter();
  const { getList, deleteUser, user: currentUser, logout } = useUserVM();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { alertProps, showAlert } = useAlert();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getList();
      setUsers(data);
    } catch (error: any) {
      showAlert({ title: 'Error', message: error.message || 'No se pudieron cargar los usuarios', singleButton: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = () => {
    showAlert({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      confirmLabel: 'Salir',
      cancelLabel: 'Cancelar',
      confirmDestructive: true,
      icon: 'logout',
      onConfirm: async () => {
        router.replace('/');
        await logout();
      }
    });
  };

  const handleDelete = (userUuid: string, userRole?: string) => {
    if (userUuid === currentUser?.user_uuid || userUuid === currentUser?.id) {
      showAlert({ title: 'Error', message: 'No puedes eliminar tu propia cuenta de administrador', singleButton: true });
      return;
    }
    if (userRole === 'SUPERUSER') {
      showAlert({ title: 'Error', message: 'No puedes eliminar a otro administrador', singleButton: true });
      return;
    }
    showAlert({
      title: 'Eliminar Usuario',
      message: '¿Estás seguro de que quieres eliminar este usuario?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      confirmDestructive: true,
      icon: 'delete',
      onConfirm: async () => {
        try {
          await deleteUser(userUuid);
          setUsers(users.filter(u => u.user_uuid !== userUuid && u.id !== userUuid));
          hapticLight();
        } catch (error: any) {
          showAlert({ title: 'Error', message: error.message || 'Error al eliminar usuario', singleButton: true });
        }
      }
    });
  };

  const renderItem = ({ item }: { item: User }) => {
    const isMe = item.user_uuid === currentUser?.user_uuid || item.id === currentUser?.id || item.user_uuid === currentUser?.id || item.id === currentUser?.user_uuid;
    return (
      <View style={s.userCard}>
        <View style={s.userInfo}>
          <Text style={s.userName}>{item.name}</Text>
          <Text style={s.userEmail}>{item.email}</Text>
            <Text style={s.userRole}>Rol: {item.role || 'USER'}</Text>
        </View>
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={() => (item.user_uuid || item.id) && handleDelete(item.user_uuid || item.id, item.role)}
          disabled={isMe || item.role === 'SUPERUSER'}
        >
          <MaterialCommunityIcons 
            name="delete" 
            size={24} 
            color={isMe ? SBColors.CERAMIC : SBColors.ERROR} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={SBColors.NEUTRAL_WARM} />
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.push('/vistas/HomeScreen')} style={s.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={SBColors.TEXT_BLACK_SOFT} />
          </TouchableOpacity>
          <Text style={s.title}>Panel de Administración</Text>
          <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={24} color={SBColors.TEXT_BLACK_SOFT} />
          </TouchableOpacity>
        </View>

        <ThemedButton
          variant="outline"
          label="Ir a Mis Recetas e Inventario"
          onPress={() => router.push('/vistas/HomeScreen')}
          style={{ marginBottom: SBSpacing.space5 }}
          fullWidth
        />

        {loading ? (
          <ActivityIndicator size="large" color={SBColors.GREEN_ACCENT} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={item => item.user_uuid || item.id || item.email}
            renderItem={renderItem}
            contentContainerStyle={s.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <ConfirmModal {...alertProps} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SBColors.NEUTRAL_WARM },
  container: { flex: 1, paddingHorizontal: SBSpacing.space4, paddingTop: SBSpacing.space4 },
  header: { 
    flexDirection: 'row', 
    marginBottom: SBSpacing.space5, 
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: { fontSize: 22, fontFamily: SBFonts.bold, color: SBColors.STARBUCKS_GREEN, flex: 1 },
  logoutBtn: { padding: 8 },
  backBtn: { padding: 8 },
  listContainer: { paddingBottom: SBSpacing.space9 },
  userCard: {
    flexDirection: 'row',
    backgroundColor: SBColors.WHITE,
    borderRadius: SBRadius.card,
    padding: SBSpacing.space4,
    marginBottom: SBSpacing.space3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontFamily: SBFonts.semibold, color: SBColors.TEXT_BLACK },
  userEmail: { fontSize: 14, fontFamily: SBFonts.regular, color: SBColors.TEXT_BLACK_SOFT, marginTop: 4 },
  userRole: { fontSize: 12, fontFamily: SBFonts.medium, color: SBColors.GREEN_ACCENT, marginTop: 4 },
  deleteBtn: { padding: 8 }
});
