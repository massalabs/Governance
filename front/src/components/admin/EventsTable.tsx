import React from 'react';

interface EventsTableProps {
    events: any[] | undefined;
    isLoading: boolean;
    error: any;
    highlightedEventId: string | null;
}

const EventsTable: React.FC<EventsTableProps> = ({ events, isLoading, error, highlightedEventId }) => {
    return (
        <div className="bg-card dark:bg-darkCard p-5 rounded-xl shadow-lg border border-border/10 dark:border-darkBorder/10 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Events</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {events?.length || 0} events
                </div>
            </div>
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">
                        {error instanceof Error ? error.message : "Failed to load events"}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border dark:border-darkBorder">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Op ID</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Slot</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events?.map((event, index) => {
                                const eventId = event.context.origin_operation_id || `${event.context.slot.period}-${event.context.slot.thread}-${event.data}`;
                                const isHighlighted = highlightedEventId === eventId;
                                const slotInfo = `P:${event.context.slot.period} T:${event.context.slot.thread}`;

                                return (
                                    <tr
                                        key={index}
                                        className={`border-b border-border dark:border-darkBorder last:border-0 transition-all duration-500 ${isHighlighted ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                    >
                                        <td className="py-3 px-4 font-mono text-sm">{event.context.origin_operation_id || 'N/A'}</td>
                                        <td className="py-3 px-4 font-mono text-sm">{slotInfo}</td>
                                        <td className="py-3 px-4 font-mono text-sm">{event.data}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default EventsTable; 