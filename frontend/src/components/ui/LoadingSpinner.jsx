const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-green-100">
      
      <div className="flex flex-col items-center gap-4">

        {/* 🌿 Spinner Circle */}
        <div className="w-16 h-16 border-4 border-green-300 border-t-green-700 rounded-full animate-spin"></div>

        {/* 🌱 Dynamic Text */}
        <p className="text-green-800 text-lg font-semibold tracking-wide">
          {text}
        </p>

      </div>
    </div>
  );
};

export default LoadingSpinner;