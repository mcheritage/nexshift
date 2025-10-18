import { Head } from '@inertiajs/react';

export default function SuperBasic() {
    return (
        <>
            <Head title="Test Shifts" />
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>Shifts Test Page</h1>
                <p>This is a super basic test to see if React is rendering at all.</p>
                <div style={{ 
                    backgroundColor: '#f0f0f0', 
                    padding: '10px', 
                    marginTop: '20px',
                    border: '1px solid #ccc'
                }}>
                    <p>If you can see this, React is working!</p>
                    <p>Time: {new Date().toLocaleString()}</p>
                </div>
            </div>
        </>
    );
}