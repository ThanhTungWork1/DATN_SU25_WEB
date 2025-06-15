

const ContentTabs = () => {
    return (
        <ul className="nav nav-tabs mt-5" id="myTab" role="tablist">
            <li className="nav-item" role="presentation">
                <button
                    className="nav-link active"
                    id="desc-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#desc"
                    type="button"
                    role="tab"
                >
                    Mô tả
                </button>
            </li>
            <li className="nav-item" role="presentation">
                <button
                    className="nav-link"
                    id="add-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#add"
                    type="button"
                    role="tab"
                >
                    Thông tin
                </button>
            </li>
            <li className="nav-item" role="presentation">
                <button
                    className="nav-link"
                    id="review-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#review"
                    type="button"
                    role="tab"
                >
                    Đánh giá [5]
                </button>
            </li>
        </ul>
    );
};

export default ContentTabs;
