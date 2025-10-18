import { Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';

interface BasicShiftsProps extends SharedData {
    shifts?: any;
    stats?: any;
    filters?: any;
}

export default function ShiftsIndex({ shifts, stats, filters }: BasicShiftsProps) {
    return (
        <AppLayout>
            <Head title="Shifts" />
            
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>
                    Shifts Management
                </h1>
                
                {/* Stats Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '24px', 
                        borderRadius: '8px', 
                        border: '1px solid #e5e5e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                            Total Shifts
                        </h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
                            {stats?.total_shifts || 0}
                        </p>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '24px', 
                        borderRadius: '8px', 
                        border: '1px solid #e5e5e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                            Published
                        </h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>
                            {stats?.published_shifts || 0}
                        </p>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '24px', 
                        borderRadius: '8px', 
                        border: '1px solid #e5e5e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                            Filled
                        </h3>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>
                            {stats?.filled_shifts || 0}
                        </p>
                    </div>
                </div>
                
                {/* Create Button */}
                <div style={{ marginBottom: '24px' }}>
                    <a 
                        href="/shifts/create"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontWeight: '500'
                        }}
                    >
                        + Post New Shift
                    </a>
                </div>
                
                {/* Shifts List */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '24px', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                        Recent Shifts
                    </h2>
                    
                    {shifts?.data && shifts.data.length > 0 ? (
                        <div>
                            {shifts.data.slice(0, 5).map((shift: any, index: number) => (
                                <div 
                                    key={shift.id || index}
                                    style={{ 
                                        padding: '16px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '6px',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>
                                            {shift.role || 'Unknown Role'}
                                        </h3>
                                        <p style={{ color: '#666', fontSize: '14px' }}>
                                            {shift.location || 'No location'}
                                        </p>
                                        <p style={{ color: '#999', fontSize: '12px' }}>
                                            {shift.start_date_time ? 
                                                new Date(shift.start_date_time).toLocaleDateString() : 
                                                'No date'
                                            }
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: '600', color: '#16a34a' }}>
                                            £{shift.hourly_rate || 0}/hour
                                        </p>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '12px',
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151'
                                        }}>
                                            {shift.status || 'draft'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px 0' }}>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                                No shifts posted yet.
                            </p>
                            <a 
                                href="/shifts/create"
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 16px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                Create Your First Shift
                            </a>
                        </div>
                    )}
                </div>
                
                {/* Debug Info */}
                <div style={{ 
                    marginTop: '32px',
                    padding: '16px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    <p><strong>Debug Info:</strong></p>
                    <p>Shifts: {shifts?.data ? `${shifts.data.length} found` : 'No data'}</p>
                    <p>Stats: {stats ? 'Present' : 'Missing'}</p>
                    <p>Filters: {filters ? 'Present' : 'Missing'}</p>
                </div>
            </div>
        </AppLayout>
    );
}