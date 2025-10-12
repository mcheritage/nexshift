export default function SimpleTest() {
    return (
        <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '24px', color: 'red' }}>SIMPLE TEST COMPONENT</h1>
            <p>If you can see this text, basic component rendering is working.</p>
            <p>Current time: {new Date().toString()}</p>
        </div>
    );
}