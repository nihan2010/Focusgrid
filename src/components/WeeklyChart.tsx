import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, subDays, parseISO } from 'date-fns';
import type { DayRecord } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface WeeklyChartProps {
    records: DayRecord[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ records }) => {
    // Build the last 7 days as date strings (oldest → newest)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) =>
        format(subDays(today, 6 - i), 'yyyy-MM-dd')
    );

    // Map date → hours
    const recordMap = new Map(records.map(r => [r.date, r.totalStudyMinutes / 60]));

    const labels = last7Days.map(d => format(parseISO(d), 'EEE d'));
    const dataValues = last7Days.map(d => parseFloat((recordMap.get(d) ?? 0).toFixed(2)));

    const hasAnyData = dataValues.some(v => v > 0);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                backgroundColor: '#18181b',
                titleColor: '#e4e4e7',
                bodyColor: '#10b981',
                borderColor: '#27272a',
                borderWidth: 1,
                callbacks: {
                    label: (ctx: any) => `${ctx.parsed.y.toFixed(1)}h focus`,
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#a1a1aa', callback: (v: any) => `${v}h` },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#a1a1aa' }
            }
        }
    };

    const chartData = {
        labels,
        datasets: [{
            label: 'Focus Hours',
            data: dataValues,
            backgroundColor: dataValues.map(v => v > 0 ? '#10b981' : 'rgba(255,255,255,0.05)'),
            borderRadius: 4,
            hoverBackgroundColor: '#059669',
        }],
    };

    if (!hasAnyData) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5">
                <span className="text-gray-500 uppercase tracking-widest text-xs font-semibold mb-2">No Data Yet</span>
                <span className="text-gray-600 text-[10px] text-center max-w-[200px]">Complete a focus session to start generating statistics.</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <Bar options={options} data={chartData} />
        </div>
    );
};
