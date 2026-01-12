"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
    {
        name: "Jan",
        total: 4,
    },
    {
        name: "Feb",
        total: 12,
    },
    {
        name: "Mar",
        total: 8,
    },
    {
        name: "Apr",
        total: 16,
    },
    {
        name: "May",
        total: 2,
    },
    {
        name: "Jun",
        total: 24,
    },
]

export function ActivityChart() {
    return (
        <div className="rounded-none border-2 border-black bg-neo-white p-6 shadow-neo h-full">
            <h3 className="font-sirukota text-xl font-black mb-4 flex items-center gap-2">
                <span className="w-4 h-4 bg-neo-mint border-2 border-black block"></span>
                MONTHLY REPORTS
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis
                        dataKey="name"
                        stroke="#000000"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        fontWeight="bold"
                    />
                    <YAxis
                        stroke="#000000"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                        fontWeight="bold"
                    />
                    <Tooltip
                        cursor={{ fill: '#FDE047', opacity: 0.2 }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-neo-black text-white border-2 border-black p-2 font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                                        <span className="block font-bold mb-1">{payload[0].payload.name}</span>
                                        <span className="block text-neo-lemon">REPORTS: {payload[0].value}</span>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Bar dataKey="total" fill="#A3E635" radius={[0, 0, 0, 0]} stroke="#000000" strokeWidth={2} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
