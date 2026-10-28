import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
afterEach(cleanup);
test('loading exposes a named status, not invented metric placeholders', async()=>{
 const {default:Loading}=await import('../src/app/dashboard/loading'); render(React.createElement(Loading));
 expect(screen.getByRole('status').textContent).toContain('Overzicht laden');
 expect(screen.queryByText('€0')).toBeNull();
});
test('unexpected dashboard failure supplies retry without disclosing provider details',async()=>{
 const {default:ErrorBoundary}=await import('../src/app/dashboard/error'); const reset=vi.fn();
 render(React.createElement(ErrorBoundary,{error:new Error('private detail'),reset}));
 expect(screen.getByRole('alert')).toBeTruthy(); expect(screen.queryByText('private detail')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Opnieuw proberen'})); expect(reset).toHaveBeenCalledTimes(1);
});
