import React from 'react';

// The Context 
const TemplateContext = React.createContext({});

// Template Provider
const TemplateProvider = ({ children }) => {

    const [myValue, setMyValue] = React.useState(0);

    // Context values passed to consumer
    const value = {
        myValue,    // <------ Expose Value to Consumer
        setMyValue  // <------ Expose Setter to Consumer
    };

    return (
        <TemplateContext.Provider value={value}>
            {children}
        </TemplateContext.Provider>
    )
}

// Template Consumer
const TemplateConsumer = ({ children }) => {
    return (
        <TemplateContext.Consumer>
            {(context) => {
                if (context === undefined) {
                    throw new Error('consumer error !!');
                }
                return children(context)
            }}
        </TemplateContext.Consumer>
    )
}

// useTemplate Hook