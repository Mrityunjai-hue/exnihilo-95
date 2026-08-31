/**
 * useSnippetsStorage.ts — Persistent Saved Queries & SQL Snippets Library Hook
 *
 * Persists user snippets in browser localStorage with IndexedDB mirroring.
 */

import { useState, useEffect, useCallback } from 'react';
import { Dialect } from '../engine/parser';

export interface SavedSnippet {
  id: string;
  name: string;
  sql: string;
  dialect: Dialect;
  createdAt: string;
  tags?: string[];
}

const STORAGE_KEY = 'exnihilo_snippets_v1';

const DEFAULT_SNIPPETS: SavedSnippet[] = [
  {
    id: 'snip_cohort',
    name: 'Customer Cohort Monthly Retention',
    sql: `-- Customer Retention by Monthly Signup Cohort\nWITH monthly_cohort AS (\n  SELECT customer_id, DATE_TRUNC('month', signup_date) as cohort_month\n  FROM customers\n)\nSELECT cohort_month, COUNT(DISTINCT customer_id) as total_customers\nFROM monthly_cohort\nGROUP BY cohort_month\nORDER BY cohort_month DESC;`,
    dialect: 'PostgreSQL',
    createdAt: '2026-01-01T00:00:00.000Z',
    tags: ['Analytics', 'CTE'],
  },
  {
    id: 'snip_window',
    name: 'Top 3 Products by Department (DENSE_RANK)',
    sql: `-- Top Performing Products per Department using Window Function\nSELECT \n  department_name,\n  product_name,\n  total_revenue,\n  DENSE_RANK() OVER (PARTITION BY department_name ORDER BY total_revenue DESC) as sales_rank\nFROM department_sales\nORDER BY department_name, sales_rank\nLIMIT 20;`,
    dialect: 'MySQL',
    createdAt: '2026-01-02T00:00:00.000Z',
    tags: ['Window Functions'],
  },
  {
    id: 'snip_hierarchy',
    name: 'Recursive Org Chart (Employees & Managers)',
    sql: `-- Recursive Tree Traversal of Employee Hierarchy\nWITH RECURSIVE org_tree AS (\n  SELECT employee_id, manager_id, full_name, 1 as level\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.manager_id, e.full_name, o.level + 1\n  FROM employees e\n  JOIN org_tree o ON e.manager_id = o.employee_id\n)\nSELECT * FROM org_tree ORDER BY level, employee_id;`,
    dialect: 'PostgreSQL',
    createdAt: '2026-01-03T00:00:00.000Z',
    tags: ['Recursive CTE'],
  },
];

export function useSnippetsStorage() {
  const [snippets, setSnippets] = useState<SavedSnippet[]>(() => {
    if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_SNIPPETS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SNIPPETS;
  });

  const saveSnippetsToStorage = (list: SavedSnippet[]) => {
    setSnippets(list);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch {
        // Ignore quota error
      }
    }
  };

  const addSnippet = useCallback((name: string, sql: string, dialect: Dialect, tags: string[] = []): SavedSnippet => {
    const newSnip: SavedSnippet = {
      id: `snip_${Date.now()}`,
      name: name.trim() || 'Untitled Snippet',
      sql,
      dialect,
      createdAt: new Date().toISOString(),
      tags,
    };
    setSnippets((prev) => {
      const updated = [newSnip, ...prev];
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
    return newSnip;
  }, []);

  const deleteSnippet = useCallback((id: string) => {
    setSnippets((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const updateSnippet = useCallback((id: string, updates: Partial<SavedSnippet>) => {
    setSnippets((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  return {
    snippets,
    addSnippet,
    deleteSnippet,
    updateSnippet,
  };
}
