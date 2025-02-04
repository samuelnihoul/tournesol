import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams } from 'react-router-dom';

import { Box, Collapse, Grid, Paper, Typography } from '@mui/material';

import CollapseButton from 'src/components/CollapseButton';
import CriteriaBarChart from 'src/components/CriteriaBarChart';
import { VideoPlayer } from 'src/components/entity/EntityImagery';
import CriteriaScoresDistribution from 'src/features/charts/CriteriaScoresDistribution';
import VideoCard from 'src/features/videos/VideoCard';
import { useLoginState } from 'src/hooks';
import { Recommendation } from 'src/services/openapi';
import { PersonalCriteriaScoresContextProvider } from 'src/hooks/usePersonalCriteriaScores';
import PersonalScoreCheckbox from 'src/components/PersonalScoreCheckbox';
import { CompareNowAction, AddToRateLaterList } from 'src/utils/action';
import linkifyStr from 'linkify-string';
import { SelectedCriterionProvider } from 'src/hooks/useSelectedCriterion';
import ContextualRecommendations from 'src/features/recommendation/ContextualRecommendations';

import VideoAnalysisActionBar from './VideoAnalysisActionBar';

export const VideoAnalysis = ({ video }: { video: Recommendation }) => {
  const { t } = useTranslation();
  const [descriptionCollapsed, setDescriptionCollapsed] = React.useState(false);

  const actions = useLoginState() ? [CompareNowAction, AddToRateLaterList] : [];

  const { criteria_scores: criteriaScores } = video;
  const shouldDisplayCharts = criteriaScores && criteriaScores.length > 0;

  const linkifyOpts = { defaultProtocol: 'https', target: '_blank' };
  const linkifiedDescription = linkifyStr(
    video.metadata.description || '',
    linkifyOpts
  );

  return (
    <Box
      p={2}
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap="16px"
      justifyContent="space-between"
    >
      <Box flex={2} minWidth={{ xs: '100%', md: null }}>
        {/* Entity section, with its player, title, scores and actions. */}
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sx={{ aspectRatio: '16 / 9' }}>
            <VideoPlayer
              videoId={video.metadata.video_id}
              duration={video.metadata.duration}
              controls
            />
          </Grid>
          <Grid item xs={12}>
            <VideoAnalysisActionBar video={video} />
          </Grid>
          <Grid item xs={12}>
            <VideoCard video={video} actions={actions} showPlayer={false} />
          </Grid>
          <Grid item xs={12}>
            <CollapseButton
              expanded={descriptionCollapsed}
              onClick={() => {
                setDescriptionCollapsed(!descriptionCollapsed);
              }}
            >
              {t('entityAnalysisPage.video.description')}
            </CollapseButton>
            <Collapse in={descriptionCollapsed} timeout="auto" unmountOnExit>
              <Typography paragraph component="div">
                <Box
                  style={
                    descriptionCollapsed
                      ? { display: 'block' }
                      : { display: 'none' }
                  }
                  dangerouslySetInnerHTML={{ __html: linkifiedDescription }}
                  fontSize="0.9em"
                  whiteSpace="pre-wrap"
                />
              </Typography>
            </Collapse>
          </Grid>

          {/* Data visualization. */}
          {shouldDisplayCharts && (
            <SelectedCriterionProvider>
              <PersonalCriteriaScoresContextProvider uid={video.uid}>
                <Grid item xs={12} sm={12} md={6}>
                  <Paper>
                    <Box
                      p={1}
                      bgcolor="rgb(238, 238, 238)"
                      display="flex"
                      justifyContent="center"
                    >
                      <Typography variant="h5">
                        {t('entityAnalysisPage.chart.criteriaScores.title')}
                      </Typography>
                    </Box>
                    <Box px={2} pt={1}>
                      <PersonalScoreCheckbox />
                    </Box>
                    <Box p={1}>
                      <CriteriaBarChart entity={video} />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <Paper sx={{ height: '100%' }}>
                    <Box
                      p={1}
                      bgcolor="rgb(238, 238, 238)"
                      display="flex"
                      justifyContent="center"
                    >
                      <Typography variant="h5">
                        {t('criteriaScoresDistribution.title')}
                      </Typography>
                    </Box>
                    <Box p={1}>
                      <CriteriaScoresDistribution entity={video} />
                    </Box>
                  </Paper>
                </Grid>
              </PersonalCriteriaScoresContextProvider>
            </SelectedCriterionProvider>
          )}
        </Grid>
      </Box>
      <Box flex={1}>
        <ContextualRecommendations
          contextUid={video.uid}
          uploader={video.metadata.uploader || undefined}
        />
      </Box>
    </Box>
  );
};

const VideoAnalysisPage = () => {
  const { video_id } = useParams<{ video_id: string }>();
  return <Redirect to={`/entities/yt:${video_id}`} />;
};

export default VideoAnalysisPage;
