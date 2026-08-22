import React from 'react';
import { ArrowUp, ArrowDown, EllipsisVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge-2';
import { Button } from './ui/button-1';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export default function SummaryCard({ title, value, icon: Icon, trend, trendValue, active, onClick, color, accentColor }) {
  const positive = trend === 'up';

  // Extract just the number from trendValue (e.g. "12%" -> "12%")
  // It's already mostly a string like "12%", let's just use it.
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:-translate-y-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200 dark:border-slate-700/50 hover:shadow-xl ${active ? 'ring-2 ring-teal-500/50 shadow-lg shadow-teal-500/10' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="border-0 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="size-6 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
            <DropdownMenuItem className="hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-700 dark:focus:bg-slate-700 cursor-pointer">View Details</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-700 dark:focus:bg-slate-700 cursor-pointer">Export Data</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-2.5 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {trendValue && (
            <Badge variant={positive ? 'success' : 'destructive'} appearance="light" className="ml-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50">
              {positive ? <ArrowUp className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <ArrowDown className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />}
              <span className={positive ? "text-emerald-400" : "text-rose-400"}>{trendValue}</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
          <span className="text-xs text-slate-500 font-medium">vs last week</span>
          {Icon && (
            <div className={`p-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 ${color?.replace('bg-', 'text-').replace('-500', '-400') || 'text-slate-400'}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
