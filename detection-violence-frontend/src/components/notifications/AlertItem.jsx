// src/components/notifications/AlertItem.jsx
const AlertItem = ({ alert }) => {
    return (
      <div className="p-4 rounded-lg shadow bg-white mb-2 border-l-4 border-red-500">
        <h3 className="font-bold">{alert.title}</h3>
        <p>{alert.description}</p>
        <p className="text-sm text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
      </div>
    );
  };
  
  export default AlertItem;

  