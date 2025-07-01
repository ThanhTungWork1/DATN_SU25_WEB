import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import type { BreadcrumbProps } from "../types/BreadcrumbType";

export const Breadcrumb = ({ items }: BreadcrumbProps) => (
  <nav className="breadcrumb-nav">
    {items.map((item, idx) => (
      <span key={idx} className="breadcrumb-item">
        {idx === 0 ? <FaHome style={{ marginRight: 4, fontSize: 15 }} /> : null}
        {item.to ? (
          <Link to={item.to} className="breadcrumb-link">
            {item.label}
          </Link>
        ) : (
          <span>{item.label}</span>
        )}
        {idx < items.length - 1 && (
          <span className="breadcrumb-separator">|</span>
        )}
      </span>
    ))}
  </nav>
);
