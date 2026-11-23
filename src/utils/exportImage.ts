/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ParticipantResult } from '../types/game';

/**
 * Generates and downloads a high-resolution JPG image of the final ladder draw results.
 */
export async function exportResultsToJpg(
  results: ParticipantResult[],
  customTitle: string = '윤관의 랜덤 사다리~~ 게임 최종 결과'
): Promise<boolean> {
  try {
    const width = 1000;
    const specialWinners = results.filter((r) => r.isSpecial);
    const hasSpecial = specialWinners.length > 0;

    // Calculate dimensions
    const headerHeight = 160;
    const specialBannerHeight = hasSpecial ? 110 : 0;
    const rowHeight = 64;
    const rowGap = 12;
    const rowsTotalHeight = results.length * (rowHeight + rowGap);
    const footerHeight = 90;
    const totalHeight = headerHeight + specialBannerHeight + rowsTotalHeight + footerHeight + 40;

    const canvas = document.createElement('canvas');
    // Retina 2x scale for ultra crisp text and lines
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = totalHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.scale(scale, scale);

    // 1. Overall Background (Clean light slate)
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, width, totalHeight);

    // 2. Header Gradient Banner
    const grad = ctx.createLinearGradient(0, 0, width, headerHeight);
    grad.addColorStop(0, '#D97706'); // Amber 600
    grad.addColorStop(0.5, '#E11D48'); // Rose 600
    grad.addColorStop(1, '#7C3AED'); // Purple 600
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, headerHeight);

    // Header Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🎉 ${customTitle}`, width / 2, 60);

    // Header Subtitle & Date
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}`;
    ctx.font = '500 16px -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`총 ${results.length}명 참여 · 추첨 일시: ${dateStr}`, width / 2, 105);

    let currentY = headerHeight + 24;

    // 3. Special Winner Highlight Banner
    if (hasSpecial) {
      const bannerX = 50;
      const bannerWidth = width - 100;
      const bannerH = 86;

      // Card background
      ctx.fillStyle = '#FEF3C7';
      drawRoundedRect(ctx, bannerX, currentY, bannerWidth, bannerH, 16);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, bannerX, currentY, bannerWidth, bannerH, 16);
      ctx.stroke();

      // Text inside banner
      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('★ 특별 지정 경품 당첨 ★', bannerX + 24, currentY + 30);

      const specialText = specialWinners
        .map((w) => `🎈 ${w.participantName} 님 ➔ ${w.prizeName}`)
        .join('   |   ');

      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(specialText, bannerX + 24, currentY + 58);

      currentY += bannerH + 24;
    }

    // 4. Participant - Prize Rows
    const rowX = 50;
    const rowWidth = width - 100;

    results.forEach((item, index) => {
      const isSpec = item.isSpecial;

      // Row Card Background
      ctx.fillStyle = isSpec ? '#FFFBEB' : '#FFFFFF';
      drawRoundedRect(ctx, rowX, currentY, rowWidth, rowHeight, 14);
      ctx.fill();

      // Row Border
      ctx.strokeStyle = isSpec ? '#FCD34D' : '#E2E8F0';
      ctx.lineWidth = isSpec ? 2 : 1;
      drawRoundedRect(ctx, rowX, currentY, rowWidth, rowHeight, 14);
      ctx.stroke();

      // Index Badge Circle in Participant Color
      const badgeX = rowX + 38;
      const badgeY = currentY + rowHeight / 2;
      ctx.fillStyle = item.participantColor || '#3B82F6';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 17, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), badgeX, badgeY);

      // Participant Name
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.participantName, rowX + 72, badgeY);

      // Arrow
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('➔', rowX + 380, badgeY);

      // Prize Name
      ctx.fillStyle = isSpec ? '#78350F' : '#1E293B';
      ctx.font = isSpec
        ? '900 19px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif'
        : 'bold 18px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'left';

      const prizeDisplay = isSpec ? `🎈 ${item.prizeName}` : item.prizeName;
      ctx.fillText(prizeDisplay, rowX + 430, badgeY);

      // Special Tag on the right edge
      if (isSpec) {
        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('★ 특별 경품', rowX + rowWidth - 28, badgeY);
      }

      currentY += rowHeight + rowGap;
    });

    // 5. Footer Watermark / Signature
    currentY += 16;
    ctx.fillStyle = '#64748B';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('공정하고 투명한 추첨 · 윤관의 랜덤 사다리~~ 게임', width / 2, currentY + 20);

    // 6. Export to JPG blob and trigger download
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const fileDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
            now.getDate()
          ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
            2,
            '0'
          )}`;
          a.download = `윤관의랜덤사다리게임_결과_${fileDate}.jpg`;
          a.href = url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          resolve(true);
        },
        'image/jpeg',
        0.96
      );
    });
  } catch (err) {
    console.error('Failed to export image:', err);
    return false;
  }
}

/**
 * Helper to draw rounded rectangle path on canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
