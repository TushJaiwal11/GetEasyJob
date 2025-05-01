
let navigate = null;

export const setNavigate = (navFn) => {
    navigate = navFn;
};

export const getNavigate = () => navigate;
