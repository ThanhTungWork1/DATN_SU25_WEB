import React from "react";
import { Link } from "react-router-dom";

interface MegaMenuProps {
  menuData: Array<{
    title: string;
    items: Array<{ label: string; link: string }>;
  }>;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ menuData }) => {
  // Gộp tất cả các mục lại thành 1 mảng lớn
  const allItems = menuData.flatMap((col) =>
    col.items.map((item) => ({ ...item, group: col.title }))
  );
  // Chia thành 2 cột đều nhau
  const mid = Math.ceil(allItems.length / 2);
  const col1 = allItems.slice(0, mid);
  const col2 = allItems.slice(mid);

  return (
    <div className="mega-menu-nam">
      <div className="mega-menu-cols">
        {/* Cột 1: render các mục và thêm mục Xem tất cả sản phẩm ở cuối */}
        <div className="mega-menu-col">
          {col1.map((item, i) => (
            <React.Fragment key={item.label}>
              {(i === 0 || item.group !== col1[i - 1]?.group) && (
                <div className="mega-menu-title">{item.group}</div>
              )}
              <ul className="mega-menu-list">
                <li>
                  <Link to={item.link}>{item.label}</Link>
                </li>
              </ul>
            </React.Fragment>
          ))}
        </div>
        {/* Cột 2 */}
        <div className="mega-menu-col">
          {col2.map((item, i) => (
            <React.Fragment key={item.label}>
              {(i === 0 || item.group !== col2[i - 1]?.group) && (
                <div className="mega-menu-title">{item.group}</div>
              )}
              <ul className="mega-menu-list">
                <li>
                  <Link to={item.link}>{item.label}</Link>
                </li>
              </ul>
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Mục Xem tất cả sản phẩm */}
      <ul className="mega-menu-list">
        <li>
          <Link to="/products" className="mega-menu-all-link">
            Xem tất cả sản phẩm &rarr;
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default MegaMenu;
