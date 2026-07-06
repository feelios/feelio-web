import styled from '@emotion/styled';
import { glass } from '../../styles/glass.js';

export const GlassCard = styled.section`
  ${({ strong }) => glass({ strong })}
  border-radius: ${({ radius = 26 }) => radius}px;
  padding: ${({ padding = 22 }) => padding}px;
`;

