import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRecipeVM } from '../src/presentation/viewmodel/RecipeVM';
import { Recipe } from '../src/domain/entities/recipe';

export default function HomeScreen() {
  const { recipes, loadRecipes } = useRecipeVM();

  useEffect(() => {
    loadRecipes();
  }, []);

  const renderItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.ingredients}>{item.ingredients.join(', ')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Recetas</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No hay recetas guardadas</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  ingredients: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: '#999',
  },
});
