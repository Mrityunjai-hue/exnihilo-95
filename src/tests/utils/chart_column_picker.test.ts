import { describe, it, expect } from 'vitest';
import { pickSmartChartColumns } from '../../utils/chartColumnPicker';

describe('pickSmartChartColumns', () => {
  it('penalizes id columns and selects quantitative measures for Y-axis', () => {
    const columns = ['id', 'customer_name', 'total_amount'];
    const rows = [
      [1, 'Alice', 150.5],
      [2, 'Bob', 240.0],
      [3, 'Charlie', 89.9],
    ];

    const { catIndex, numIndex } = pickSmartChartColumns(columns, rows);
    // X should be customer_name (index 1)
    expect(catIndex).toBe(1);
    // Y should be total_amount (index 2), NOT id (index 0)
    expect(numIndex).toBe(2);
  });

  it('handles datasets without explicit id penalty', () => {
    const columns = ['department', 'salary'];
    const rows = [
      ['Engineering', 120000],
      ['Sales', 95000],
      ['Marketing', 85000],
    ];

    const { catIndex, numIndex } = pickSmartChartColumns(columns, rows);
    expect(catIndex).toBe(0); // department
    expect(numIndex).toBe(1); // salary
  });

  it('safely handles single-column or empty datasets', () => {
    expect(pickSmartChartColumns([], [])).toEqual({ catIndex: 0, numIndex: 0 });
    expect(pickSmartChartColumns(['single'], [[1]])).toEqual({ catIndex: 0, numIndex: 0 });
  });
});
