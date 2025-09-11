type CardSlotProps = {
    children: React.ReactNode;
  };

  const CardSlot = ({ children }: CardSlotProps) => {
    return (
      <div className="card bg-base-100 shadow-lg p-6 mb-3">
        {children}
      </div>
    );
  };
  
  export default CardSlot;