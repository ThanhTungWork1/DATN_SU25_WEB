import { useState, useEffect } from 'react';
import { ApiHomeSection } from '../api/ApiHomeSection';
import { HomeSectionResponse, HomeSection } from '../types/HomeSection';

export const useHomeSection = () => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await ApiHomeSection.getHomeSections();
      setSections(response.sections);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu sections');
      console.error('Error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return {
    sections,
    loading,
    error,
    refetch: fetchSections
  };
}; 