// /**
//  * Generates custom prop configurations for MUI Tooltips
//  * @param {string} direction - The placement orientation ('top', 'bottom', 'left', 'right', etc.)
//  * @param {string} themeColor - Dynamic hex border color matching the candle signal
//  */
 const getTooltipConfig = (direction = 'top', themeColor = '#f5a623') => {
  return {
    placement: direction,
    arrow: true,
    slotProps: {
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, -4], 
            },
          },
        ],
      },
    },
    componentsProps: {
      tooltip: {
        sx: {
          backgroundColor: '#1e293b', 
          color: '#f8fafc',          
          fontSize: '13px',          
          padding: '8px 12px',       
          borderRadius: '6px',       
          maxWidth: '260px',         
          boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          border: `1px solid ${themeColor}`, 
          '& .MuiTooltip-arrow': {
            color: '#1e293f',        
          },
        },
      },
    },
  };
};


export default getTooltipConfig;
