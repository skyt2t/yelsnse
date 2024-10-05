import { Component } from "react";
import { useSwipeable } from "react-swipeable";
import JobCard from "../JobCardPage";
import axios from 'axios';
import "./index.css";

const JobSwipeCard = ({ job, onBookmark, onDismiss }) => {
    const handlers = useSwipeable({
        onSwipedLeft: () => {
            console.log(`Swiped left: ${job.title}`);
            onDismiss(job);
        },
        onSwipedRight: () => {
            console.log(`Swiped right: ${job.title}`);
            onBookmark(job);
        },
    });

    return (
        <div {...handlers} className="job-swipe-card">
            <JobCard job={job} />
        </div>
    );
};

class Jobs extends Component {
    state = {
        jobs: [],
        bookmarkedJobs: JSON.parse(localStorage.getItem('bookmarkedJobs')) || [],
        hasMore: true,
        page: 1,
        loading: false,
        error: null
    };

    componentDidMount() {
        console.log('Component mounted, fetching jobs...');
        this.handleFetchJobs();
    }

    handleFetchJobs = () => {
        const { page } = this.state;
        this.setState({ loading: true });
        console.log(`Fetching jobs for page ${page}...`);

        axios.get(`https://testapi.getlokalapp.com/common/jobs?page=${page}`)
            .then(response => {
                const newJobs = response.data.results;
                console.log('Fetched jobs:', newJobs);

                if (newJobs.length > 0) {
                    this.setState(prevState => ({
                        jobs: [...prevState.jobs, ...newJobs],
                        page: prevState.page + 1,
                        loading: false
                    }));
                    console.log(`Loaded ${newJobs.length} new jobs.`);
                } else {
                    this.setState({ hasMore: false, loading: false });
                    console.log('No more jobs available.');
                }
            })
            .catch(error => {
                console.log('Error fetching jobs', error);
                this.setState({ loading: false, error: 'Failed to fetch jobs' });
            });
    };

    handleBookmarkJob = (job) => {
        let { bookmarkedJobs } = this.state;
        const isBookmarked = bookmarkedJobs.some(item => item.id === job.id);
        
        if (!isBookmarked) {
            bookmarkedJobs.push(job);
            console.log(`Bookmarked job: ${job.title}`);
        } else {
            console.log(`Job already bookmarked: ${job.title}`);
        }

        this.setState({ bookmarkedJobs });
        localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarkedJobs));
        console.log('Updated bookmarked jobs:', bookmarkedJobs);
    };

    handleDismissJob = (job) => {
        this.setState(prevState => {
            const updatedJobs = prevState.jobs.filter(item => item.id !== job.id);
            console.log(`Dismissed job: ${job.title}`);
            return { jobs: updatedJobs };
        });
    };

    render() {
        const { jobs, error } = this.state;

        return (
            <div className="jobs-container">
                <h1 className="title">Job Opportunities</h1>
                {error && <p className="error-message">{error}</p>}
                <div className="job-list">
                    {jobs.map((job) => (
                        <JobSwipeCard
                            key={job.id}
                            job={job}
                            onBookmark={this.handleBookmarkJob}
                            onDismiss={this.handleDismissJob}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default Jobs;
