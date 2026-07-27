import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipes, useToggleFavoriteRecipe, useDeleteRecipe } from '../hooks/useRecipes';
import { confirmAction } from '../../../shared/lib/confirm';
import { useRecipeFormStore } from '../store/recipeFormStore';
import AddRecipeModal from '../components/AddRecipeModal';
import type { Tables } from '../../../shared/types/database';
import EmptyState from '../../../shared/ui/EmptyState';
import Fab from '../../../shared/ui/Fab';
import { useThemeVars } from '../../../shared/theme/useThemeVars';

export default function RecipesScreen() {
  const { data: recipes = [] } = useRecipes();
  const openModal = useRecipeFormStore((s) => s.openModal);
  const openEditModal = useRecipeFormStore((s) => s.openEditModal);
  const toggleFavorite = useToggleFavoriteRecipe();
  const deleteRecipe = useDeleteRecipe();
  const { primary } = useThemeVars();

  function handleDelete(item: Tables<'recipes'>) {
    confirmAction({
      title: 'Hapus resep?',
      message: item.name,
      onConfirm: () => deleteRecipe.mutate(item.id),
    });
  }

  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="mb-2.5 flex-row items-center justify-between rounded-xl bg-card p-3.5">
            <Pressable
              onPress={() => openEditModal(item)}
              className="flex-1 flex-row items-center gap-3 pr-3"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
                <Ionicons name="restaurant-outline" size={16} color={primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink">{item.name}</Text>
                {item.ingredients ? (
                  <Text className="mt-0.5 text-xs text-muted" numberOfLines={1}>
                    {item.ingredients}
                  </Text>
                ) : null}
                <Text className="mt-1 text-[10px] text-subtle">ketuk untuk edit</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => toggleFavorite.mutate({ id: item.id, isFavorite: !item.is_favorite })}
              className="h-9 w-9 items-center justify-center"
            >
              <Ionicons
                name={item.is_favorite ? 'star' : 'star-outline'}
                size={22}
                color={item.is_favorite ? primary : '#8A8D94'}
              />
            </Pressable>
            <Pressable
              hitSlop={10}
              onPress={() => handleDelete(item)}
              className="h-9 w-9 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={16} color="#E5766D" />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="restaurant-outline" text="Belum ada resep tersimpan." />}
      />

      <Fab onPress={openModal} />

      <AddRecipeModal />
    </View>
  );
}
