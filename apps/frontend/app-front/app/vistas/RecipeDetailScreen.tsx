import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Recipe } from '../src/domain/entities/recipe';

export default function RecipeDetailScreen() {
  const { id, name, ingredients, steps } = useLocalSearchParams();
  
  const recipe: Recipe = {
    id: id as string,
    name: name as string,
    ingredients: ingredients ? JSON.parse(ingredients as string) : [],
    steps: steps ? JSON.parse(steps as string) : [],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{recipe.name}</Text>
      
      <Text style={styles.sectionTitle}>Ingredientes</Text>
      {recipe.ingredients.map((ingredient, index) => (
        <Text key={index} style={styles.item}>- {ingredient}</Text>
      ))}
      
      <Text style={styles.sectionTitle}>Pasos</Text>
      {recipe.steps.map((step, index) => (
        <Text key={index} style={styles.item}>{index + 1}. {step}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
  },
});
