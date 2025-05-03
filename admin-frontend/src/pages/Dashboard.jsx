import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Container,
  useTheme
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupIcon from '@mui/icons-material/Group';
import AlbumIcon from '@mui/icons-material/Album';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import BuildIcon from '@mui/icons-material/Build';

const features = [
  {
    icon: <GroupIcon fontSize="large" color="success" />,
    title: 'Tổng quan trực quan',
    description: 'Dễ dàng theo dõi tổng số người dùng, bài hát, album và nghệ sĩ.',
  },
  {
    icon: <MusicNoteIcon fontSize="large" color="primary" />,
    title: 'Cập nhật thời gian thực',
    description: 'Theo dõi người dùng mới, bài hát vừa thêm hoặc được phát gần nhất.',
  },
  {
    icon: <AlbumIcon fontSize="large" color="secondary" />,
    title: 'Quản lý nội dung',
    description: 'Tối ưu thao tác với người dùng, bài hát, album, nghệ sĩ.',
  },
  {
    icon: <PersonIcon fontSize="large" color="warning" />,
    title: 'Giao diện hiện đại',
    description: 'Thiết kế thân thiện, dễ dùng, linh hoạt cho quản trị viên.',
  },
];

const Dashboach = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box textAlign="center" mb={4}>
        <InfoIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Spotify Admin Panel – Giới Thiệu
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Công cụ quản trị toàn diện dành cho quản lý nền tảng âm nhạc
        </Typography>
      </Box>

      <Box mb={5}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🌟 Tính năng nổi bật
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper elevation={2} sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {feature.icon}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mb={5}>
        <Box display="flex" alignItems="center" mb={1}>
          <EmojiObjectsIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">Mục tiêu của chúng tôi</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Giúp đội ngũ vận hành Spotify quản lý dữ liệu hiệu quả, nhanh chóng và chính xác –
          từ người dùng cuối đến nội dung âm nhạc.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box>
        <Box display="flex" alignItems="center" mb={1}>
          <BuildIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">Được phát triển bởi</Typography>
        </Box>
        <Typography variant="body2">Spotify Admin Team</Typography>
        <Typography variant="caption">© 2025 Spotify AB</Typography>
      </Box>
    </Container>
  );
};

export default Dashboach;
