import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import ErrorsDisplay from './ErrorsDisplay.js';
import { Link } from 'react-router-dom';

export default class CourseDetail extends Component {

    constructor(props) {
      super(props);
      this.state = {
        course : [],
        student: [],
        params: props.match.params,
        user: [],
        errors:[],
        authenticatedUser: [],
        context: this.props.context
      };
    }
  
    //set state after mounting
    componentDidMount(){
        const { context } = this.props;
        fetch(`http://localhost:5000/api/courses/${this.state.params.id}`)
            .then( response => response.json())
            .then( responseData => {
                this.setState({ 
                course: responseData,
                student: responseData.student,
                context: this.props.context,
                authenticatedUser: context.authenticatedUser
                });
            return responseData
            })
    }

    //delete course if authorized user
    submit = () => {
        const { context } = this.props;
        const { emailAddress, password } = context.authenticatedUser;
        const path = `/courses/${this.state.params.id}`;
        const currentUserId = Number(this.props.context.authenticatedUser.id)
        const courseUserId = Number(this.state.course.userId)
        if (currentUserId === courseUserId) {
            context.data.deleteCourse(emailAddress, password, path)
                .then( errors => {
                    if (errors.length) {
                        this.setState({errors});
                    } else {
                        this.props.history.push('/');
                    }
                })
                .catch( err => {
                    this.props.history.push('/error');
                })
        } else {
            this.setState({
                errors: ['Not authorized to delete course.']
            })
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const confirmDelete = window.confirm("Delete course?");
        if (confirmDelete) {
            this.submit();
        }
    }

    //add update and delete buttons if authorized user
    render() {
        const {errors} = this.state;
        let buttons;
        if (this.props.context.authenticatedUser) {
            const currentUserId = Number(this.props.context.authenticatedUser.id)
            const courseUserId = Number(this.state.course.userId)
            if (currentUserId === courseUserId) {
                buttons = (           
                <div className="grid-100"><span>
                    <Link className="button" to={`/courses/${this.state.params.id}/update`}>Update Course</Link>
                    <button onClick={this.handleSubmit} className="button">Delete Course</button>
                   </span>
                    <Link className="button button-secondary" to="/">Return to List</Link></div>);
            } else {
                buttons = (
                    <div className="grid-100"><Link
                    className="button button-secondary" to="/">Return to List</Link></div>
                )
            }
        } else {
            buttons = (
                <div className="grid-100"><Link
                className="button button-secondary" to="/">Return to List</Link></div>
            )
        }
        return (
            <div>
                <div className="actions--bar">
                <div className="bounds">
                    {buttons}
                </div>
                </div>
                <ErrorsDisplay errors={errors} />
                <div className="bounds course--detail">
                    <div className="grid-66">
                    <div className="course--header">
                        <h4 className="course--label">Course</h4>
                        <h3 className="course--title">{this.state.course.title}</h3>
                        <p>By {`${this.state.student.firstName} ${this.state.student.lastName}`}</p>
                    </div>
                    <div className="course--description">
                        <ReactMarkdown source={this.state.course.description} /> 
                    </div>
                    </div>
                    <div className="grid-25 grid-right">
                    <div className="course--stats">
                        <ul className="course--stats--list">
                        <li className="course--stats--list--item">
                            <h4>Estimated Time</h4>
                            <h3>{this.state.course.estimatedTime}</h3>
                        </li>
                        <li className="course--stats--list--item">
                            <h4>Materials Needed</h4>
                            <ul>
                                <ReactMarkdown source={this.state.course.materialsNeeded} /> 
                            </ul>
                        </li>
                        </ul>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}
