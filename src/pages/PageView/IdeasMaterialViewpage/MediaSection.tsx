import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import MediaTypeCard from './MediaTypeCard';

interface MediaSectionProps {
    sectionId: string;
    sectionIndex: number;
    title: string;
    description: string;
    videos: any[];
    documents: any[];
    images: any[];
    expandedKey: string | null;
    onToggleMediaType: (sectionId: string, mediaType: string) => void;
}

export default function MediaSection({
    sectionId,
    // sectionIndex is not strictly used in current logic but kept for interface consistency
    title,
    description,
    videos,
    documents,
    images,
    expandedKey,
    onToggleMediaType,
}: MediaSectionProps) {
    const theme = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ breakInside: 'avoid', marginBottom: '24px' }}
        >
            <Card
                sx={{
                    backgroundColor: 'white',
                    borderRadius: { xs: 1.5, sm: 3 },
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                    mb: { xs: '5px', sm: 4 },
                    overflow: 'hidden',
                    mx: { xs: 0, sm: 2 },
                }}
            >
                <CardContent sx={{ p: { xs: '5px', sm: 3, md: 4 } }}>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary.main"
                        mb={{ xs: 1, sm: 2 }}
                        sx={{
                            fontSize: { xs: '1.1rem', sm: '1.4rem', md: '1.8rem' },
                            lineHeight: 1.2,
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        mb={{ xs: 1.5, sm: 3 }}
                        sx={{
                            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                            lineHeight: 1.6,
                        }}
                    >
                        {description}
                    </Typography>

                    <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                        <MediaTypeCard
                            type="videos"
                            icon={<VideoLibraryIcon />}
                            items={videos}
                            color={theme.palette.error.main}
                            emoji="🎬"
                            sectionId={sectionId}
                            expandedKey={expandedKey}
                            onToggleMediaType={onToggleMediaType}
                        />
                        <MediaTypeCard
                            type="documents"
                            icon={<PictureAsPdfIcon />}
                            items={documents}
                            color={theme.palette.success.main}
                            emoji="📄"
                            sectionId={sectionId}
                            expandedKey={expandedKey}
                            onToggleMediaType={onToggleMediaType}
                        />
                        <MediaTypeCard
                            type="images"
                            icon={<ImageIcon />}
                            items={images}
                            color={theme.palette.warning.main}
                            emoji="🖼️"
                            sectionId={sectionId}
                            expandedKey={expandedKey}
                            onToggleMediaType={onToggleMediaType}
                        />
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
}
