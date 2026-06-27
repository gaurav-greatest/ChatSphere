import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store.js';

/**
 * Typed Redux hooks — use these instead of plain useDispatch/useSelector
 * throughout the entire app for full TypeScript inference.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
