

const Color = () => {
    return (
        <div className="mb-3">
            <label className="fw-bold">Color:</label>
            <div>
                <span className="color-circle bg-dark"></span>
                <span className="color-circle bg-primary"></span>
                <span className="color-circle bg-warning"></span>
            </div>
        </div>
    );
};

export default Color;
